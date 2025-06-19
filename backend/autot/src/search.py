"""search for magnet links in index"""

import json
import logging
from hashlib import md5, sha1
from urllib.parse import quote

import bencodepy
import requests
from django.db.models import QuerySet
from movie.models import Movie
from tv.models import TVEpisode, TVSeason

from autot.models import Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.helper import get_magnet_hash, get_tracker_list
from autot.src.redis_con import AutotRedis

logger = logging.getLogger("django")


class Jackett:
    """implement jackett indexer"""

    TIMEOUT: int = 300
    CONFIG: ConfigType = get_config()
    CATEGORY_MAP: dict[str, int] = {
        "episode": 5000,
        "season": 5000,
        "movie": 2000,
    }

    def free_search(self, search_term: str, category: str | None) -> list[dict]:
        """free form search"""
        base = self.CONFIG["JK_URL"]
        key = self.CONFIG["JK_API_KEY"]
        query = quote(search_term)
        url = f"{base}/api/v2.0/indexers/all/results?apikey={key}&Query={query}"
        if category:
            if jk_category := self.CATEGORY_MAP.get(category):
                url += f"&Category[]={jk_category}"

        results = self.make_request(url)
        if results:
            self._cache_free_search(results)

        return results

    def _cache_free_search(self, results):
        """cache in redis for ID lookup"""
        messages = {"search:" + i["Id"]: json.dumps(i) for i in results}
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
        base = self.CONFIG["JK_URL"]
        key = self.CONFIG["JK_API_KEY"]
        key_words = self._parse_keywords(to_search.get_keywords())
        query = quote(f"{to_search.search_query} {key_words}")
        category = self._get_category(to_search)
        url = f"{base}/api/v2.0/indexers/all/results?apikey={key}&Query={query}&Category[]={category}"

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

        results_json = response.json()
        results = results_json["Results"]
        for result in results:
            hex_hash = md5(json.dumps(result).encode()).digest().hex()
            result["Id"] = hex_hash

        results_sorted = sorted(results, key=lambda x: x["Gain"], reverse=True)

        return results_sorted

    def extract_magnet(self, result: dict) -> tuple[str | None, str | None]:
        """extract magnet from list or results"""
        magnet_link = result.get("MagnetUri")
        if magnet_link:
            return magnet_link, result.get("Title")

        torrent_link = result.get("Link")
        if not torrent_link:
            raise ValueError("failed to extract magnet")

        response = requests.get(torrent_link, allow_redirects=False, timeout=self.TIMEOUT)
        if response.status_code == 200:
            is_torrent = response.headers.get("Content-Type") == "application/x-bittorrent"
            if is_torrent:
                magnet_link = Magnator(response.content).get_magnet()
                return magnet_link, result.get("Title")

        location = response.headers.get("Location")
        if location and location.startswith("magnet:?"):
            return location, result.get("Title")

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
        has_link = result_item.get("MagnetUri") or result_item.get("Link")
        has_seeders = result_item.get("Seeders", 0) > 2
        has_gain = result_item.get("Gain", 0) > 1
        is_valid_path = to_search.is_valid_path(result_item["Title"])

        is_filesize_target = True
        if hasattr(to_search, "target_file_size"):
            lower, upper = to_search.target_file_size
            if lower and upper and result_item.get("Size"):
                size_is = result_item["Size"]
                is_filesize_target = size_is >= lower * 1000 and size_is <= upper * 1000

        to_exclude = [i.word for i in to_search.get_keywords().filter(direction="e")]
        is_not_excluded = not any(i for i in to_exclude if i in result_item["Title"])

        return all([has_link, has_seeders, has_gain, is_valid_path, is_not_excluded, is_filesize_target])


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
        for item in self.metadata.get(b"announce-list", []):
            for tracker in item:
                tracker_list.append(tracker.decode())

        if not tracker_list:
            tracker_list = get_tracker_list()

        encoded_trackers = "&tr=".join(quote(tracker) for tracker in tracker_list)

        return encoded_trackers
