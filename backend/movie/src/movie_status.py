"""check movies"""

import logging
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from movie.models import Movie, MovieRelease, MovieReleaseTarget

from autot.models import Torrent, log_change
from autot.src.search import Jackett

logger = logging.getLogger("django")


class MovieStatus:
    """find movie status"""

    def refresh(self) -> bool:
        """refresh all movie status"""
        self.set_upcoming()
        self.set_searching()

        found_movie_magnets = self.find_movie_magnets()
        plain_torrents = Torrent.objects.filter(torrent_state="u", torrent_type="m").exists()

        return any([found_movie_magnets, plain_torrents])

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

        query = Q()
        for release_type in target_object.target:
            if not release_type["tracking"]:
                continue

            cutoff = timezone.now()
            if release_type["days_delay"]:
                cutoff = cutoff - timedelta(days=release_type["days_delay"])

            query |= Q(
                release_type=release_type["release_target"],
                release_date__lte=cutoff,
            )

        query &= Q(movie__status="u")

        movie_ids = MovieRelease.objects.filter(query).values_list("movie_id", flat=True).distinct()
        if not movie_ids:
            return

        to_update = Movie.objects.filter(id__in=movie_ids)
        for movie in to_update:
            old_status = movie.status
            movie.status = "s"
            movie.save()
            log_change(movie, "u", field_name="status", old_value=old_status, new_value="s")

    def find_movie_magnets(self) -> bool:
        """find magnets for searching movies"""
        found_magnets = False
        to_search = Movie.objects.filter(status="s")
        if not to_search:
            return found_magnets

        logger.info("Searching for %s magnet(s)", to_search.count())

        for movie in to_search:
            magnet, title = Jackett().get_magnet(movie)
            if not magnet:
                continue

            movie.add_magnet(magnet, title)
            found_magnets = True

        return found_magnets
