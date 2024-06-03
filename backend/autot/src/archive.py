"""archive completed torrents"""

from django.db.models import QuerySet
from transmission_rpc.torrent import Torrent as TransmissionTorrent
from tv.models import TVEpisode
from autot.src.config import get_config
from autot.src.download import Transmission
from autot.models import Torrent


class Archiver:
    """archive media file"""

    CONFIG = get_config()

    def archive(self) -> bool:
        """archive all"""
        to_archive = self._get_to_archive()
        if not to_archive:
            return False

        for torrent in to_archive:
            self.archive_single_torrent(torrent)

        return True

    def _get_to_archive(self) -> QuerySet:
        """get finished torrents"""
        return Torrent.objects.filter(torrent_state="f")

    def archive_single_torrent(self, torrent: Torrent) -> None:
        """run archiver"""
        tm = Transmission()
        tm_torrent = tm.get_single(torrent)
        if not tm_torrent or not tm_torrent.is_finished:
            return

        if torrent.torrent_type in ["e", "s"]:
            episodes = TVEpisode.objects.filter(torrent=torrent).exclude(status="f")
            for episode in episodes:
                self._archive_episode(tm_torrent, episode)
        else:
            raise NotImplementedError

        tm.delete(tm_torrent)
        torrent.torrent_state = "a"
        torrent.save()

    def _archive_episode(self, tm_torrent: TransmissionTorrent, episode: TVEpisode) -> None:
        """archive tvfile"""
        filename = self._get_valid_media_file(tm_torrent, episode)
        download_path = self.CONFIG["TM_BASE_FOLDER"] / filename
        if not download_path.exists():
            raise FileNotFoundError(f"didn't find expected {str(download_path)}")

        print(f"archive {episode.file_name}")
        episode_path = episode.get_archive_path(suffix=download_path.suffix)
        archive_path = self.CONFIG["TV_BASE_FOLDER"] / episode_path
        archive_path.parent.mkdir(parents=True, exist_ok=True)
        download_path.rename(archive_path)
        episode.status = "f"
        episode.save()

    def _get_valid_media_file(self, tm_torrent: TransmissionTorrent, episode: TVEpisode) -> str:
        """get valid media file"""
        for torrent_file in tm_torrent.get_files():
            if torrent_file.size < self.CONFIG["MEDIA_MIN_SIZE"]:
                continue
            if torrent_file.name.split(".")[-1] not in self.CONFIG["MEDIA_EXT"]:
                continue

            is_valid_path = episode.is_valid_path(torrent_file.name.lower())
            if is_valid_path:
                return torrent_file.name

        raise FileNotFoundError(f"didn't find expected media file in {tm_torrent}")
