"""check movies"""

from autot.models import Torrent


class MovieStatus:
    """find movie status"""

    def refresh(self) -> bool:
        """refresh all movie status"""

        plain_torrents = Torrent.objects.filter(torrent_state="u").exists()

        return any([plain_torrents])
