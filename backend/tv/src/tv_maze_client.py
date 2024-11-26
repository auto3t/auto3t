"""interact with TVmaze.com API"""

import logging

import requests

logger = logging.getLogger("django")


class TVMaze:
    """API client"""

    BASE: str = "https://api.tvmaze.com"
    TIMEOUT: int = 60

    def get(self, url: str) -> dict | None:
        """make get request"""

        response = requests.get(f"{self.BASE}/{url}", timeout=self.TIMEOUT)
        if not response.ok:
            logger.error("Request to tvmaze.com failed with status: %s, error: %s", response.status_code, response.text)
            return None

        return response.json()
