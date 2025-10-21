"""interact with themoviedb.org API"""

import requests

from autot.src.config import ConfigType, get_config


class MovieDB:
    """API client"""

    BASE: str = "https://api.themoviedb.org/3"
    TIMEOUT: int = 60
    CONFIG: ConfigType = get_config()

    def get(self, url: str) -> dict | None:
        """make get request"""
        sep = "&" if "?" in url else "?"
        url_full = f"{self.BASE}/{url}{sep}api_key={self.CONFIG['MOVIE_DB_API_KEY']}"
        response = requests.get(url_full, timeout=self.TIMEOUT)
        if not response.ok:
            print(response.text)
            return None

        return response.json()
