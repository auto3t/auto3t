"""search for magnet links in index"""

from urllib.parse import quote

import requests
from django.db.models import QuerySet
from autot.models import TVEpisode, TVSeason
from autot.src.config import get_config, ConfigType


class BaseIndexer:
    """base class implementing indexer search"""

    TIMEOUT: int = 300

    def get_magnet(self, to_search: TVEpisode | TVSeason) -> str | None:
        """get magnet link"""
        raise NotImplementedError

    def make_request(self, url: str) -> list[dict]:
        """make request against indexed, return list of results"""
        raise NotImplementedError

    def select_link(self, results: list[dict]) -> str | None:
        """select most desired magnet link"""
        raise NotImplementedError

    def parse_keywords(self, keywords: QuerySet) -> str | None:
        """join keywords from query set"""
        return " ".join([i.word for i in keywords])


class Jackett(BaseIndexer):
    """implement jackett indexer"""

    CONFIG: ConfigType = get_config()

    def get_magnet(self, to_search: TVEpisode | TVSeason) -> str | None:
        """get episode magnet link"""
        url = self.build_url(to_search)
        results = self.make_request(url)
        magnet = self.select_link(results)

        return magnet

    def build_url(self, to_search: TVEpisode | TVSeason) -> str:
        """build jacket search url"""
        base = self.CONFIG["JK_URL"]
        key = self.CONFIG["JK_API_KEY"]
        key_words = self.parse_keywords(to_search.get_keywords)
        query = quote(f"{to_search.search_query} {key_words}")
        url = f"{base}/api/v2.0/indexers/all/results?apikey={key}&Query={query}&Category[]=5000"

        return url

    def make_request(self, url) -> list[dict]:
        """make request against jackett api"""
        response = requests.get(url, timeout=self.TIMEOUT)
        if not response.ok:
            raise ValueError

        results = response.json()

        return results["Results"]

    def select_link(self, results: list[dict]) -> str | None:
        """filter for best link"""
        valid_magnets = list(filter(self._filter_magnets, results))
        if not valid_magnets:
            print("no valid magnet option found")
            return None

        sorted_magnets = sorted(valid_magnets, key=lambda x: x["Gain"], reverse=True)

        return sorted_magnets[0]["MagnetUri"]

    @staticmethod
    def _filter_magnets(result_item: dict) -> bool:
        """remove poor results"""
        has_magnet = result_item.get("MagnetUri")
        has_seeders = result_item.get("Seeders", 0) > 2
        has_gain = result_item.get("Gain", 0) > 1

        return all([has_magnet, has_seeders, has_gain])
