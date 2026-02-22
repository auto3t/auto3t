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

        response = requests.get(f"{base_path}/api/{path}", headers=headers, timeout=self.TIMEOUT)
        if not response.ok:
            logger.error("imdb-db request failed, status %s, error %s", response.status_code, response.text)
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


def get_cached_imdb_rating(imdb_id: str | None) -> float | None:
    """get imdb rating"""
    if not imdb_id:
        return None

    imdb_handler = IMDB()
    if not imdb_handler.is_enabled:
        return None

    title = imdb_handler.get_title(imdb_id)
    if not title:
        return None

    key = f"imdb:{imdb_id}:rating"
    rating = cache.get_or_set(key, lambda: title.get("average_rating"), timeout=settings.CACHE_TTL)

    return rating
