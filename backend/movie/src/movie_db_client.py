"""interact with themoviedb.org API"""

import logging
from time import sleep

import requests
from autot.src.config import ConfigType, get_config

logger = logging.getLogger("django")


class MovieDB:
    """API client"""

    BASE: str = "https://api.themoviedb.org/3"
    TIMEOUT: int = 60
    CONFIG: ConfigType = get_config()
    RETRY_BACKOFF = [5, 10, 15]

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

        return response.json()
