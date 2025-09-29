"""search for magnet links in index"""

import json
import logging
from hashlib import md5
from urllib.parse import quote

import requests
from django.db.models import QuerySet
from movie.models import Movie
from tv.models import TVEpisode, TVSeason

from autot.models import Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.helper import get_magnet_hash
from autot.src.redis_con import AutotRedis

logger = logging.getLogger("django")


class SearchIndex:
    """implement prowlarr search indexer"""

    TIMEOUT: int = 300
    CONFIG: ConfigType = get_config()
    CATEGORY_MAP: dict[str, int] = {
        "episode": 5000,
        "season": 5000,
        "movie": 2000,
    }

    def free_search(self, search_term: str, category: str | None) -> list[dict]:
        """free form search"""
        base = self.CONFIG["PRR_URL"]
        key = self.CONFIG["PRR_KEY"]
        query = quote(search_term)
        url = f"{base}/api/v1/search?apikey={key}&query={query}"
        if category:
            if media_category := self.CATEGORY_MAP.get(category):
                url += f"&categories={media_category}"

        results = self.make_request(url)
        if results:
            self._cache_free_search(results)

        return results

    def _cache_free_search(self, results):
        """cache in redis for ID lookup"""
        messages = {"search:" + i["id"]: json.dumps(i) for i in results}
        AutotRedis().set_messages(messages, expire=3600)

    def get_magnet(self, to_search: TVEpisode | TVSeason | Movie) -> tuple[str | None, str | None]:
        """get episode magnet link"""
        to_ignore = []
        if isinstance(to_search, (TVEpisode, Movie)):
            to_ignore = [i.magnet_hash for i in to_search.torrent.filter(torrent_state="i")]
        elif isinstance(to_search, TVSeason):
            torrents = Torrent.objects.filter(torrent_state="i", torrent_type="s", torrent_tv__season=to_search)
            to_ignore = [i.magnet_hash for i in torrents]

        url = self.build_url(to_search)
        results = self.make_request(url)
        valid_results = self.validate_links(results, to_search)
        if not valid_results:
            log_change(to_search, "u", comment="No valid magnet option found.")
            return None, None

        for result in valid_results:
            try:
                magnet, title = self.extract_magnet(result)
                if not magnet:
                    continue

                if get_magnet_hash(magnet) in to_ignore:
                    continue

                return magnet, title
            except ValueError:
                continue

        return magnet, title

    def build_url(self, to_search: TVEpisode | TVSeason) -> str:
        """build jacket search url"""
        base = self.CONFIG["PRR_URL"]
        key = self.CONFIG["PRR_KEY"]
        key_words = self._parse_keywords(to_search.get_keywords())
        query = quote(f"{to_search.search_query} {key_words}")
        category = self._get_category(to_search)
        url = f"{base}/api/v1/search?apikey={key}&query={query}&categories={category}"

        return url

    def _parse_keywords(self, keywords: QuerySet) -> str | None:
        """join keywords from query set"""
        return " ".join([i.word for i in keywords if i.direction == "i"])

    def _get_category(self, to_search: TVEpisode | TVSeason | Movie) -> int:
        """get category for jackett"""
        if isinstance(to_search, (TVEpisode, TVSeason)):
            return 5000
        if isinstance(to_search, Movie):
            return 2000

        raise NotImplementedError

    def make_request(self, url) -> list[dict]:
        """make request against jackett api"""
        response = requests.get(url, timeout=self.TIMEOUT)
        if not response.ok:
            raise ValueError

        results = response.json()
        for result in results:
            hex_hash = md5(json.dumps(result).encode()).digest().hex()
            result["id"] = hex_hash
            result["gain"] = int(result.get("seeders", 0) * (result.get("size", 0) / 1024.0 / 1024.0 / 1024.0))

        results_sorted = sorted(results, key=lambda x: x["gain"], reverse=True)

        return results_sorted

    def extract_magnet(self, result: dict) -> tuple[str | None, str | None]:
        """extract magnet from list or results"""
        magnet_link = result.get("guid")
        if magnet_link:
            return magnet_link, result.get("title")

        raise ValueError("failed to extract magnet")

    def validate_links(self, results: list[dict], to_search: TVEpisode | TVSeason) -> list[dict] | None:
        """validate for auto tasks"""
        valid_magnets = list(filter(lambda result: self._filter_magnets(result, to_search), results))
        if not valid_magnets:
            return None

        return valid_magnets

    @staticmethod
    def _filter_magnets(result_item: dict, to_search: TVEpisode | TVSeason | Movie) -> bool:
        """filter function to remove poor results"""
        has_magnet = result_item.get("guid")
        has_seeders = result_item.get("seeders", 0) > 2
        has_gain = result_item.get("gain", 0) > 1
        is_valid_path = to_search.is_valid_path(result_item["title"], strict=True)

        is_filesize_target = True
        if hasattr(to_search, "target_file_size"):
            lower, upper = to_search.target_file_size
            if lower and upper and result_item.get("size"):
                size_is = result_item["size"]
                is_filesize_target = size_is >= lower * 1000 and size_is <= upper * 1000

        to_exclude = [i.word for i in to_search.get_keywords().filter(direction="e")]
        is_not_excluded = not any(i for i in to_exclude if i in result_item["title"])

        return all([has_magnet, has_seeders, has_gain, is_valid_path, is_not_excluded, is_filesize_target])
