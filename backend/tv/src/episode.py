"""deal with episodes"""

import logging
from datetime import datetime, timedelta

from django.db.models import Count, F, Q
from django.utils import timezone
from tv.models import TVEpisode, TVSeason

from autot.models import Torrent, log_change
from autot.src.search import Jackett

logger = logging.getLogger("django")


class EpisodeStatus:
    """find episode status"""

    def refresh(self) -> bool:
        """refresh all episode status"""
        self.set_upcoming()
        self.set_searching()
        found_season_magnets = self.find_seasons_magnets()
        found_episode_magnets = self.find_episode_magnets()
        plain_torrents = Torrent.objects.filter(torrent_state="u").exists()

        return any([found_episode_magnets, found_season_magnets, plain_torrents])

    def set_upcoming(self):
        """set upcoming state if has release date"""
        to_update = TVEpisode.objects.filter(status__isnull=True, release_date__isnull=False)
        if not to_update:
            return

        for episode in to_update:
            old_status = episode.status
            episode.status = "u"
            episode.save()
            log_change(episode, "u", field_name="status", old_value=old_status, new_value="u")

    def set_searching(self):
        """set episodes to searching"""
        lte = datetime.today().astimezone() + timedelta(hours=6)
        to_update = TVEpisode.objects.filter(status="u", release_date__lte=lte)
        if not to_update:
            return

        for episode in to_update:
            old_status = episode.status
            episode.status = "s"
            episode.save()
            log_change(episode, "u", field_name="status", old_value=old_status, new_value="s")

    def find_seasons_magnets(self) -> bool:
        """find complete season magnets"""
        found_magnets = False
        finished_seasons = TVSeason.objects.filter(end_date__lt=timezone.now())
        searching_seasons = finished_seasons.annotate(
            total_episodes=Count("tvepisode"), searching_episodes=Count("tvepisode", filter=Q(tvepisode__status="s"))
        ).filter(total_episodes=F("searching_episodes"))

        if not searching_seasons:
            return found_magnets

        for season in searching_seasons:
            magnet = Jackett().get_magnet(season)
            if not magnet:
                continue

            season_episodes = TVEpisode.objects.filter(season=season)
            for episode in season_episodes:
                episode.add_magnet(magnet)

            found_magnets = True
            log_change(season, "c", comment="Added magnet for season episodes")

        return found_magnets

    def find_episode_magnets(self) -> bool:
        """find magnet links for searching episodes"""
        found_magnets = False
        to_search = TVEpisode.objects.filter(status="s").exclude(torrent__isnull=False)
        if not to_search:
            return found_magnets

        logger.info("Searching for %s magnet(s)", to_search.count())
        for episode in to_search:
            magnet = Jackett().get_magnet(episode)
            if not magnet:
                continue

            episode.add_magnet(magnet)
            found_magnets = True

        return found_magnets
