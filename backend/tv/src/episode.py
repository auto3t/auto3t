"""deal with episodes"""

from datetime import datetime, timedelta

from django.db.models import Count, F, Q
from django.utils import timezone
from tv.models import TVEpisode, TVSeason
from autot.models import Torrent, log_change
from autot.src.search import Jackett


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
        if to_update:
            print(f"set {to_update.count()} episodes as upcoming")
            to_update.update(status="u")
            for episode in to_update:
                log_change(episode, "u", field_name="status", new_value="u")

    def set_searching(self):
        """set episodes to searching"""
        lte = datetime.today().astimezone() + timedelta(hours=6)
        to_update = TVEpisode.objects.filter(status="u", release_date__lte=lte)
        if to_update:
            print(f"set {to_update.count()} episodes as searching")
            to_update.update(status="s")
            for episode in to_update:
                log_change(episode, "u", field_name="status", old_value="u", new_value="s")

    def find_seasons_magnets(self) -> bool:
        """find complete season magnets"""
        found_magnets = False
        finished_seasons = TVSeason.objects.filter(end_date__lt=timezone.now())
        searching_seasons = finished_seasons.annotate(
            total_episodes=Count("tvepisode"),
            searching_episodes=Count("tvepisode", filter=Q(tvepisode__status="s"))
        ).filter(
            total_episodes=F("searching_episodes")
        )

        if not searching_seasons:
            return found_magnets

        for season in searching_seasons:
            magnet = Jackett().get_magnet(season)
            if not magnet:
                continue

            torrent, _ = Torrent.objects.get_or_create(magnet=magnet, torrent_type="s")
            season_episodes = TVEpisode.objects.filter(season=season)

            for episode in season_episodes:
                old_torrent = episode.torrent.magnet_hash
                old_status = episode.status
                episode.torrent = torrent
                episode.status = "d"
                episode.save()
                log_change(episode, "c", field_name="torrent", old_value=old_torrent, new_value=torrent.magnet_hash)
                log_change(episode, "c", field_name="status", old_value=old_status, new_value="d")

            found_magnets = True
            print(f"{season}: added magnet {torrent.magnet_hash}")

        return found_magnets

    def find_episode_magnets(self) -> bool:
        """find magnet links for searching episodes"""
        found_magnets = False
        to_search = TVEpisode.objects.filter(status="s").exclude(torrent__isnull=False)
        if not to_search:
            return found_magnets

        print(f"searching for {to_search.count()} magnets")
        for episode in to_search:
            magnet = Jackett().get_magnet(episode)
            if not magnet:
                continue

            episode.add_magnet(magnet)
            found_magnets = True
            print(f"{episode}: added magnet {episode.torrent.magnet_hash}")

        return found_magnets
