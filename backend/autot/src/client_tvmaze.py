"""interact with TVmaze.com API"""

import requests


class TVMaze:
    """API client"""

    BASE: str = "https://api.tvmaze.com"
    TIMEOUT: int = 60

    def get(self, url: str) -> dict | None:
        """make get request"""

        response = requests.get(f"{self.BASE}/{url}", timeout=self.TIMEOUT)
        if not response.ok:
            print(response.text)
            return None

        return response.json()
