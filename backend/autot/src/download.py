"""download item"""

from transmission_rpc import Client
from transmission_rpc.torrent import Torrent as TransmissionTorrent
from autot.models import Torrent
from autot.src.config import get_config, ConfigType


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

    def delete(self, torrent: TransmissionTorrent) -> None:
        """delete torrent"""
        self.transission_client.remove_torrent(torrent.id, delete_data=True)

    def update_state(self):
        """loop through torrents update model state"""
        in_queue = {i.hashString: i.status.value for i in self.transission_client.get_torrents()}
        to_check = Torrent.objects.filter(torrent_state="q") | Torrent.objects.filter(torrent_state="d")

        if not to_check:
            return

        for local_torrent in to_check:
            state = in_queue.get(local_torrent.magnet_hash)
            if not state:
                continue

            if state == "downloading":
                local_torrent.torrent_state = "d"
            elif state == "download pending":
                local_torrent.torrent_state = "q"
            elif state == "stopped":
                local_torrent.torrent_state = "f"

            local_torrent.save()
