"""interact with themoviedb.org API"""

import logging
from time import sleep

import requests
from autot.src.config import ConfigType, get_config
from autot.src.redis_con import AutotRedis

logger = logging.getLogger("django")


class MovieDB:
    """API client"""

    BASE: str = "https://api.themoviedb.org/3"
    TIMEOUT: int = 60
    CONFIG: ConfigType = get_config()
    RETRY_BACKOFF = [5, 10, 15]
    IMDB_MAPPING_KEY = "tmdb:imdb:movie"

    def get(self, url: str) -> dict | None:
        """make get request"""
        sep = "&" if "?" in url else "?"
        url_full = f"{self.BASE}/{url}{sep}api_key={self.CONFIG['MOVIE_DB_API_KEY']}"
        response = requests.get(url_full, timeout=self.TIMEOUT)

        if response.status_code == 429:
            for delay in self.RETRY_BACKOFF:
                logger.info("Got 429 from themoviedb, retry in: %s sec", delay)
                sleep(delay)
                response = requests.get(url_full, timeout=self.TIMEOUT)
                if response.status_code != 429:
                    break

        if not response.ok:
            logger.error("Request to themoviedb failed with status: %s, error: %s", response.status_code, response.text)
            return None

        response_json = response.json()

        return response_json

    def get_imdb_id(self, the_moviedb_id: str) -> str | None:
        """get imdb id"""
        cache_key = f"{self.IMDB_MAPPING_KEY}:{the_moviedb_id}"
        cached = AutotRedis().get_message(cache_key)
        if cached:
            return cached

        response = self.get(f"movie/{the_moviedb_id}/external_ids")
        if response and response.get("imdb_id"):
            imdb_id = response["imdb_id"]
            expire = 60 * 60 * 24 * 180  # 180d
        else:
            imdb_id = ""
            expire = 60 * 60 * 24 * 7  # 7d

        AutotRedis().set_message(cache_key, imdb_id, expire=expire)
        if imdb_id:
            return imdb_id

        return None
