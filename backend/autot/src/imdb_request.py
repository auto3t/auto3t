"""
fetch from imdb container
https://github.com/bbilly1/imdb-db
"""

import logging

import requests
from autot.src.config import get_config
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger("django")


class IMDB:
    """wrapper for fetching from IMDB DB"""

    CONFIG = get_config()
    TIMEOUT = 30

    @property
    def is_enabled(self) -> bool:
        """check if enabled"""
        return bool(self.CONFIG["IMDB_DB_URL"] and self.CONFIG["IMDB_DB_API_KEY"])

    def make_request(self, path: str = "") -> dict | list[dict] | None:
        """make request"""
        base_path = self.CONFIG["IMDB_DB_URL"]
        api_key = self.CONFIG["IMDB_DB_API_KEY"]

        headers = None
        if api_key:
            headers = {"Authorization": f"Bearer {api_key}"}

        try:
            response = requests.get(f"{base_path}/api/{path}", headers=headers, timeout=self.TIMEOUT)
            if not response.ok:
                logger.error("imdb-db request failed, status %s, error %s", response.status_code, response.text)
                return None
        except requests.exceptions.ConnectionError as err:
            logger.error("imdb-db request failed: %s", str(err))
            return None

        return response.json()

    def ping(self) -> bool:
        """check api status"""
        response = self.make_request()
        return bool(response)

    def get_title(self, tconst: str) -> dict | None:
        """get single title"""
        response = self.make_request(f"titles/{tconst}")
        if isinstance(response, dict):
            return response

        return None

    def get_titles(self, tconst_list: list[str]) -> list[dict]:
        """fetch titles in bulk"""
        if not tconst_list:
            return []

        params = f"tconst={'&tconst='.join(tconst_list)}"
        response = self.make_request(f"titles?{params}")
        if not isinstance(response, list):
            return []

        return response

    def get_episodes(self, tconst: str) -> list[dict]:
        """get episodes of show"""
        if not tconst:
            return []

        response = self.make_request(f"series/{tconst}/episodes")
        if not isinstance(response, list):
            return []

        return response


def get_cached_imdb_rating(imdb_id: str | None) -> float | None:
    """get imdb rating"""
    if not imdb_id:
        return None

    imdb_handler = IMDB()
    if not imdb_handler.is_enabled:
        return None

    key = f"imdb:{imdb_id}:rating"
    cached_rating = cache.get(key)
    if cached_rating:
        return cached_rating

    title = imdb_handler.get_title(imdb_id)
    if not title:
        return None

    rating = title.get("average_rating")
    cache.set(key, rating, timeout=settings.CACHE_TTL)

    return rating


def get_cached_show_ratings(imdb_id: str | None):
    """get cached imdb show ratings"""
    if not imdb_id:
        return None

    imdb_handler = IMDB()
    if not imdb_handler.is_enabled:
        return None

    key = f"imdb:{imdb_id}:episode_ratings"
    cached_episode_ratings = cache.get(key)
    if cached_episode_ratings:
        return cached_episode_ratings

    episodes = imdb_handler.get_episodes(tconst=imdb_id)

    episode_ratings: dict[int, list[dict[str, int]]] = {}
    for episode in episodes:
        if not episode_ratings.get(episode["season_number"]):
            episode_ratings[episode["season_number"]] = []

        episode_ratings[episode["season_number"]].append(
            {
                "episode_number": episode["episode_number"],
                "average_rating": episode["average_rating"],
                "num_votes": episode["num_votes"],
            }
        )

    cache.set(key, episode_ratings, timeout=settings.CACHE_TTL)

    return episode_ratings
