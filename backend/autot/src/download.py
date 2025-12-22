"""download item"""

from math import ceil

from autot.src.config import ConfigType, get_config
from autot.src.helper import get_tracker_list
from autot.static import MovieStatus, TvEpisodeStatus
from django.utils import timezone
from movie.models import Movie
from transmission_rpc import Client
from transmission_rpc.torrent import Torrent as TransmissionTorrent
from tv.models import Torrent, TVEpisode


class Transmission:
    """implement transmission downloader"""

    CONFIG: ConfigType = get_config()
    ACTIVITY_THRESH = 3600

    def __init__(self):
        self.transission_client = Client(
            host=self.CONFIG["TM_URL"],
            port=self.CONFIG["TM_PORT"],
            username=self.CONFIG["TM_USER"],
            password=self.CONFIG["TM_PASS"],
        )

    def add_all(self) -> None:
        """add all undefined state"""
        to_add = Torrent.objects.filter(torrent_state="u")
        if not to_add:
            return

        for torrent in to_add:
            self.add_single(torrent)

    def add_single(self, torrent: Torrent) -> None:
        """add torrent to transmission queue"""
        self.transission_client.add_torrent(torrent.magnet)
        torrent.torrent_state = "q"
        torrent.save()

    def get_single(self, torrent: Torrent) -> TransmissionTorrent | None:
        """get single torrent instance"""
        all_torrents = self.transission_client.get_torrents()
        for torrent_item in all_torrents:
            if torrent_item.hashString == torrent.magnet_hash:
                return torrent_item

        return None

    def cancel(self, torrent: Torrent) -> Torrent:
        """cancel and reset torrent"""
        updated_torrent = torrent.set_to_ignore()
        to_delete = self.get_single(torrent)
        if to_delete:
            self.delete(to_delete)

        return updated_torrent

    def delete(self, torrent: TransmissionTorrent) -> None:
        """delete torrent"""
        self.transission_client.remove_torrent(torrent.id, delete_data=True)

    def update_state(self) -> tuple[bool, bool]:
        """loop through torrents update model state"""
        in_queue = {i.hashString: i for i in self.transission_client.get_torrents()}
        to_check = Torrent.objects.filter(torrent_state="q") | Torrent.objects.filter(torrent_state="d")

        needs_checking: bool = bool(to_check)
        needs_archiving: bool = False

        if not needs_checking:
            return needs_checking, needs_archiving

        for local_torrent in to_check:
            remote_torrent = in_queue.get(local_torrent.magnet_hash)
            if not remote_torrent:
                local_torrent.set_to_ignore()
                continue

            has_files = remote_torrent.get_files()
            if has_files and not local_torrent.has_expected_files:
                self.validate_expected(remote_torrent, local_torrent)
                if local_torrent.torrent_state == "i":
                    continue

            state = remote_torrent.status.value
            if state == "downloading":
                local_torrent.torrent_state = "d"
                local_torrent.progress = ceil(remote_torrent.progress)
            elif state == "download pending":
                local_torrent.torrent_state = "q"
                if remote_torrent.progress:
                    local_torrent.progress = ceil(remote_torrent.progress)

            elif state == "stopped" and remote_torrent.is_finished:
                local_torrent.torrent_state = "f"
                local_torrent.progress = None
                needs_archiving = True

            local_torrent.save()

        return needs_checking, needs_archiving

    def needs_refresh(self, remote_torrent: TransmissionTorrent) -> bool:
        """return True if torrent is not working"""
        if remote_torrent.status.value != "downloading":
            return False

        is_new = remote_torrent.seconds_downloading < self.ACTIVITY_THRESH
        if is_new:
            return False

        last_activity = remote_torrent.activity_date
        has_activity = bool(last_activity.timestamp())
        has_recent_activity = timezone.now().utcnow().timestamp() - last_activity.timestamp() < self.ACTIVITY_THRESH

        if has_activity and has_recent_activity:
            return False

        return True

    def validate_expected(self, remote_torrent: TransmissionTorrent, local_torrent: Torrent):
        """validate expected files are in torrent"""
        if local_torrent.torrent_type == "e":
            self._check_single_episode(remote_torrent, local_torrent)
        elif local_torrent.torrent_type in ["s", "w"]:
            self._check_multi_episode(remote_torrent, local_torrent)
        elif local_torrent.torrent_type == "m":
            self._check_single_movie(remote_torrent, local_torrent)

    def _check_single_episode(self, remote_torrent: TransmissionTorrent, local_torrent: Torrent) -> None:
        """check single episode"""
        episode = TVEpisode.objects.get(torrent=local_torrent)
        is_valid = self._is_valid(remote_torrent, to_check=episode)
        if is_valid:
            local_torrent.has_expected_files = True
            local_torrent.save()
            return

        self.cancel(local_torrent)
        episode.status = TvEpisodeStatus.s.name
        episode.save()
        local_torrent.has_expected_files = False
        local_torrent.save()

    def _check_multi_episode(self, remote_torrent: TransmissionTorrent, local_torrent: Torrent) -> None:
        """check multi episode torrent"""
        episodes = TVEpisode.objects.filter(torrent=local_torrent)
        for episode in episodes:
            is_valid = self._is_valid(remote_torrent, to_check=episode)
            if is_valid:
                continue

            self.cancel(local_torrent)
            episodes.update(status=TvEpisodeStatus.s.name)
            local_torrent.has_expected_files = False
            local_torrent.save()
            return

        local_torrent.has_expected_files = True
        local_torrent.save()

    def _check_single_movie(self, remote_torrent: TransmissionTorrent, local_torrent: Torrent) -> None:
        """check single movie"""
        movie = Movie.objects.get(torrent=local_torrent)
        is_valid = self._is_valid(remote_torrent, to_check=movie)
        if is_valid:
            local_torrent.has_expected_files = True
            local_torrent.save()
            return

        self.cancel(local_torrent)
        movie.status = MovieStatus.s.name
        movie.save()
        local_torrent.has_expected_files = False
        local_torrent.save()

    def _is_valid(self, remote_torrent: TransmissionTorrent, to_check: Movie | TVEpisode) -> bool:
        """check for expected"""
        from autot.src.archive import Archiver

        try:
            Archiver().get_valid_media_file(remote_torrent, to_check)
            return True
        except FileNotFoundError:
            pass

        return False

    def add_trackers(self):
        """add trackers for transmissions"""
        tracker_list = get_tracker_list()
        tracker_list_list = [[i] for i in tracker_list]
        for torrent in self.transission_client.get_torrents():
            self.transission_client.change_torrent(torrent.id, tracker_list=tracker_list_list)
