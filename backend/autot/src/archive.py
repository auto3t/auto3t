"""archive completed torrents"""

import shutil
from pathlib import Path

from django.db.models import QuerySet
from transmission_rpc.torrent import Torrent as TransmissionTorrent

from autot.models import Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.download import Transmission
from tv.models import TVEpisode


class Archiver:
    """archive media file"""

    CONFIG: ConfigType = get_config()

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
        old_state = torrent.torrent_state
        torrent.torrent_state = "a"
        torrent.save()
        log_change(torrent, "u", field_name="torrent_state", old_value=old_state, new_value="a")

    def _archive_episode(self, tm_torrent: TransmissionTorrent, episode: TVEpisode) -> None:
        """archive tvfile"""
        filename = self._get_valid_media_file(tm_torrent, episode)
        download_path: Path = self.CONFIG["TM_BASE_FOLDER"] / filename
        if not download_path.exists():
            raise FileNotFoundError(f"didn't find expected {str(download_path)}")

        episode_path = episode.get_archive_path(suffix=download_path.suffix)
        archive_path = self.CONFIG["TV_BASE_FOLDER"] / episode_path
        archive_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(download_path, archive_path, copy_function=shutil.copyfile)
        old_status = episode.status
        episode.status = "f"
        episode.save()
        log_change(episode, "u", field_name="status", old_value=old_status, new_value="f")

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
