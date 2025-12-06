"""interact with TVmaze.com API"""

import logging
from time import sleep

import requests

logger = logging.getLogger("django")


class TVMaze:
    """API client"""

    BASE: str = "https://api.tvmaze.com"
    TIMEOUT: int = 60
    RETRY_BACKOFF = [5, 10, 15]

    def get(self, url: str) -> dict | list | None:
        """make get request"""

        response = requests.get(f"{self.BASE}/{url}", timeout=self.TIMEOUT)

        if response.status_code == 429:
            for delay in self.RETRY_BACKOFF:
                logger.info("Got 429 from tvmaze, retry in: %s sec", delay)
                sleep(delay)
                response = requests.get(f"{self.BASE}/{url}", timeout=self.TIMEOUT)
                if response.status_code != 429:
                    break

        if not response.ok:
            logger.error("Request to tvmaze failed with status: %s, error: %s", response.status_code, response.text)
            return None

        return response.json()
