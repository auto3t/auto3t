"""download item"""

from math import ceil

from django.utils import timezone
from transmission_rpc import Client
from transmission_rpc.torrent import Torrent as TransmissionTorrent

from autot.models import log_change
from autot.src.config import ConfigType, get_config
from tv.models import Torrent, TVEpisode


class DownloaderBase:
    """base class"""

    def add_all(self) -> None:
        """add item to download"""
        raise NotImplementedError

    def delete(self, torrent: Torrent) -> None:
        """delete item from download"""
        raise NotImplementedError

    def update_state(self):
        """loop through torrents update model state"""
        raise NotImplementedError


class Transmission(DownloaderBase):
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
        old_state = torrent.torrent_state
        torrent.torrent_state = "q"
        torrent.save()
        log_change(torrent, "u", field_name="torrent_state", old_value=old_state, new_value="q")

    def get_single(self, torrent: Torrent) -> TransmissionTorrent | None:
        """get single torrent instance"""
        all_torrents = self.transission_client.get_torrents()
        for torrent_item in all_torrents:
            if torrent_item.hashString == torrent.magnet_hash:
                return torrent_item

        return None

    def cancle(self, torrent: Torrent) -> None:
        """cancle and reset torrent"""
        episodes = TVEpisode.objects.filter(torrent=torrent)
        for episode in episodes:
            episode.torrent = None
            episode.status = None
            episode.media_server_id = None
            episode.save()
            log_change(episode, "u", comment=f"Cancle Torrent Download: {torrent.magnet_hash}")

        to_delete = self.get_single(torrent)
        if to_delete:
            self.delete(to_delete)
            torrent.delete()

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
            old_state = local_torrent.torrent_state
            remote_torrent = in_queue.get(local_torrent.magnet_hash)
            if not remote_torrent:
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
            if old_state != local_torrent.torrent_state:
                log_change(
                    local_torrent,
                    "u",
                    field_name="torrent_state",
                    old_value=old_state,
                    new_value=local_torrent.torrent_state,
                )

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
