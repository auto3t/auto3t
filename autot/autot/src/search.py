"""search for magnet links in index"""

from urllib.parse import quote

import requests
from django.db.models import QuerySet
from autot.models import TVEpisode
from autot.src.config import get_config, ConfigType


class BaseIndexer:
    """base class implementing indexer search"""

    TIMEOUT: int = 300

    def get_magnet(self, episode: TVEpisode) -> str | None:
        """get magnet link"""
        raise NotImplementedError

    def build_tv_url(self, episode: TVEpisode) -> str:
        """build api url to search"""
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

    def get_magnet(self, episode: TVEpisode) -> str | None:
        """get magnet link"""
        url = self.build_tv_url(episode)
        results = self.make_request(url)
        magnet = self.select_link(results)

        return magnet

    def build_tv_url(self, episode: TVEpisode) -> str:
        """build jacket search url"""
        base = self.CONFIG["JK_URL"]
        key = self.CONFIG["JK_API_KEY"]
        show = episode.season.show.name
        season_nr = str(episode.season.number).zfill(2)
        episode_nr = str(episode.number).zfill(2)
        key_words = self.parse_keywords(episode.get_keywords)
        query = quote(f"{show} S{season_nr}E{episode_nr} {key_words}")

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
        valid = [i for i in results if i.get("MagnetUri") and i["Seeders"] > 2]
        if not valid:
            print("no valid magnet option found")
            return None

        return valid[0]["MagnetUri"]
