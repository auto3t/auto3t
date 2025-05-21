"""check movies"""

from movie.models import Movie

from autot.models import log_change


class MovieStatus:
    """find movie status"""

    def refresh(self) -> bool:
        """refresh all movie status"""
        self.set_upcoming()

        # plain_torrents = Torrent.objects.filter(torrent_state="u").exists()

        return False

    def set_upcoming(self):
        """set upcoming movie state"""
        to_update = Movie.objects.filter(status__isnull=True)
        if not to_update:
            return

        for movie in to_update:
            old_status = movie.status
            movie.status = "u"
            movie.save()
            log_change(movie, "u", field_name="status", old_value=old_status, new_value="u")
