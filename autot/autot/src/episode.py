"""deal with episodes"""

from datetime import datetime

from autot.models import TVEpisode, Torrent
from autot.src.search import Jackett


class EpisodeStatus:
    """find episode status"""

    def set_upcoming(self):
        """set upcoming state if has release date"""
        to_update = TVEpisode.objects.filter(status__isnull=True, release_date__isnull=False)
        if to_update:
            print(f"set {to_update.count()} episodes as upcoming")
            to_update.update(status="u")

    def set_searching(self):
        """set episodes to searching"""
        to_update = TVEpisode.objects.filter(status="u", release_date__lte=datetime.today().astimezone())
        if to_update:
            print(f"set {to_update.count()} episodes as searching")
            to_update.update(status="s")

    def find_magnets(self):
        """find magnet links for searching episodes"""
        to_search = TVEpisode.objects.filter(status="s")
        if not to_search:
            return

        print(f"searching for {to_search.count()} magnets")
        for episode in to_search:
            magnet = Jackett().get_magnet(episode)
            if not magnet:
                return

            torrent = Torrent.objects.create(magnet=magnet, torrent_type="t")
            episode.torrent = torrent
            episode.save()
