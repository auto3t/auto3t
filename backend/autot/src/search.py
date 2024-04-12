"""search for magnet links in index"""

from hashlib import sha1
from urllib.parse import quote

import bencodepy
import requests
from django.db.models import QuerySet
from autot.models import TVEpisode, TVSeason
from autot.src.config import get_config, ConfigType


class BaseIndexer:
    """base class implementing indexer search"""

    TIMEOUT: int = 300

    def get_magnet(self, to_search: TVEpisode | TVSeason) -> str | bytes | None:
        """get magnet link"""
        raise NotImplementedError

    def make_request(self, url: str) -> list[dict]:
        """make request against indexed, return list of results"""
        raise NotImplementedError

    def select_link(self, results: list[dict], to_search: TVEpisode | TVSeason) -> str | bytes | None:
        """select most desired magnet link"""
        raise NotImplementedError

    def parse_keywords(self, keywords: QuerySet) -> str | None:
        """join keywords from query set"""
        return " ".join([i.word for i in keywords])


class Jackett(BaseIndexer):
    """implement jackett indexer"""

    CONFIG: ConfigType = get_config()

    def get_magnet(self, to_search: TVEpisode | TVSeason) -> str | bytes | None:
        """get episode magnet link"""
        url = self.build_url(to_search)
        results = self.make_request(url)
        magnet = self.select_link(results, to_search)

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

    def select_link(self, results: list[dict], to_search: TVEpisode | TVSeason) -> str | bytes | None:
        """filter for best link"""
        valid_magnets = list(filter(lambda result: self._filter_magnets(result, to_search), results))
        if not valid_magnets:
            print("no valid magnet option found")
            return None

        sorted_magnets = sorted(valid_magnets, key=lambda x: x["Gain"], reverse=True)
        magnet_link = sorted_magnets[0].get("MagnetUri")
        if magnet_link:
            return magnet_link

        torrent_link = sorted_magnets[0].get("Link")
        if not torrent_link:
            raise ValueError("faild to extract magnet")

        response = requests.get(torrent_link, allow_redirects=False, timeout=self.TIMEOUT)
        if response.status_code == 200:
            is_torrent = response.headers.get("Content-Type") == "application/x-bittorrent"
            if is_torrent:
                magnet_link = Magnator(response.content).get_magnet()
                return magnet_link

        location = response.headers.get("Location")
        if location and location.startswith("magnet:?"):
            return location

        raise ValueError("faild to extract magnet")

    @staticmethod
    def _filter_magnets(result_item: dict, to_search: TVEpisode | TVSeason) -> bool:
        """filter function to remove poor results"""
        has_link = result_item.get("MagnetUri") or result_item.get("Link")
        has_seeders = result_item.get("Seeders", 0) > 2
        has_gain = result_item.get("Gain", 0) > 1
        is_valid_path = to_search.is_valid_path(result_item["Title"])

        return all([has_link, has_seeders, has_gain, is_valid_path])


class Magnator:
    """convert torrent bytes object into magnet link"""

    def __init__(self, torrent_bytes: bytes):
        self.metadata = bencodepy.bdecode(torrent_bytes)

    def get_magnet(self) -> str:
        """entry point"""
        hex_hash = self._get_hex()
        name = self._get_display_name()
        trackers = self._parse_trackers()
        magnet_link = f"magnet:?xt=urn:btih:{hex_hash}&dn={name}&tr={trackers}"

        return magnet_link

    def _get_hex(self) -> str:
        """get hex hash"""
        encoded_info = bencodepy.bencode(self.metadata[b"info"])
        hex_hash = sha1(encoded_info).digest().hex()

        return hex_hash

    def _get_display_name(self) -> str:
        """get display name"""
        display_name = self.metadata[b"info"][b"name"].decode()
        return display_name

    def _parse_trackers(self) -> str:
        """build encoded tracker list"""
        tracker_list = []
        for item in self.metadata[b"announce-list"]:
            for tracker in item:
                tracker_list.append(tracker.decode())

        encoded_trackers = "&tr=".join(quote(tracker) for tracker in tracker_list)

        return encoded_trackers
