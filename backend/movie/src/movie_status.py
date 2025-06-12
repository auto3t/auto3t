"""check movies"""

from movie.models import Movie, MovieReleaseTarget

from autot.models import log_change


class MovieStatus:
    """find movie status"""

    def refresh(self) -> bool:
        """refresh all movie status"""
        self.set_upcoming()
        self.set_searching()

        return False

    def set_upcoming(self):
        """set upcoming movie state"""
        to_update = Movie.objects.filter(status__isnull=True, release_date__isnull=False)
        if not to_update:
            return

        for movie in to_update:
            old_status = movie.status
            movie.status = "u"
            movie.save()
            log_change(movie, "u", field_name="status", old_value=old_status, new_value="u")

    def set_searching(self):
        """mark as searching when targeted"""
        target_object = MovieReleaseTarget.objects.first()
        if not target_object:
            return

        to_update = Movie.objects.filter(status="u", movierelease__release_type__in=target_object.target).distinct()
        if not to_update:
            return

        for movie in to_update:
            old_status = movie.status
            movie.status = "s"
            movie.save()
            log_change(movie, "u", field_name="status", old_value=old_status, new_value="s")
