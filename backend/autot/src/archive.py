"""archive completed torrents"""

from collections.abc import Callable
from pathlib import Path

from autot.models import AppConfig, Torrent, log_change
from autot.src.archive_options import copy, copy_and_delete, hard_link, move
from autot.src.config import ConfigType, get_config
from autot.src.download import Transmission
from django.db.models import QuerySet
from movie.models import Movie
from transmission_rpc.torrent import Torrent as TransmissionTorrent
from tv.models import TVEpisode


class Archiver:
    """archive media file"""

    CONFIG: ConfigType = get_config()
    ARCHIVE_METHOD = {
        "m": {
            "func": move,
            "delete_t": True,
        },
        "c": {
            "func": copy,
            "delete_t": False,
        },
        "d": {
            "func": copy_and_delete,
            "delete_t": True,
        },
        "l": {
            "func": hard_link,
            "delete_t": False,
        },
    }

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
        if not tm_torrent:
            torrent.torrent_state = "i"
            torrent.save()
            return

        if not tm_torrent.is_finished:
            return

        archive_options = self._get_archive_function()

        if torrent.torrent_type in ["e", "s", "w"]:
            episodes = TVEpisode.objects.filter(torrent=torrent).exclude(status="f")
            for episode in episodes:
                self._archive_episode(tm_torrent, episode, archive_options["func"])
        elif torrent.torrent_type == "m":
            movie = Movie.objects.get(torrent=torrent)
            self._archive_movie(tm_torrent, movie, archive_options["func"])
        else:
            raise NotImplementedError

        if archive_options["delete_t"]:
            tm.delete(tm_torrent)

        torrent.torrent_state = "a"
        torrent.save()

    def _get_archive_function(self) -> dict:
        """get archive function based on appconfig"""
        app_config, _ = AppConfig.objects.get_or_create(single_lock=1)
        file_operation = app_config.file_archive_operation
        archive_function = self.ARCHIVE_METHOD.get(file_operation)
        if not archive_function:
            raise NotImplementedError(f"archive function not implemented: {file_operation}")

        return archive_function

    def _archive_episode(self, tm_torrent: TransmissionTorrent, episode: TVEpisode, archive_func: Callable) -> None:
        """archive tvfile"""
        filename = self.get_valid_media_file(tm_torrent, episode)
        download_path: Path = self.CONFIG["TM_BASE_FOLDER"] / filename
        if not download_path.exists():
            raise FileNotFoundError(f"didn't find expected {str(download_path)}")

        episode_path = episode.get_archive_path(suffix=download_path.suffix)
        archive_path = self.CONFIG["TV_BASE_FOLDER"] / episode_path

        archive_func(src_file=download_path, target_file=archive_path)

        old_status = episode.status
        episode.status = "f"
        episode.save()
        log_change(episode, "u", field_name="status", old_value=old_status, new_value="f")

    def get_valid_media_file(self, tm_torrent: TransmissionTorrent, episode: TVEpisode) -> str:
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

    def _archive_movie(self, tm_torrent: TransmissionTorrent, movie: Movie, archive_func: Callable) -> None:
        """archive movie"""
        filename = self._get_valid_movie_file(tm_torrent, movie)
        download_path: Path = self.CONFIG["TM_BASE_FOLDER"] / filename
        if not download_path.exists():
            raise FileNotFoundError(f"didn't find expected {str(download_path)}")

        movie_path = movie.get_archive_path(suffix=download_path.suffix)
        archive_path = self.CONFIG["MOVIE_BASE_FOLDER"] / movie_path

        archive_func(src_file=download_path, target_file=archive_path)

        old_status = movie.status
        movie.status = "f"
        movie.save()
        log_change(movie, "u", field_name="status", old_value=old_status, new_value="f")

    def _get_valid_movie_file(self, tm_torrent: TransmissionTorrent, movie: Movie) -> str:
        """get valid media file"""
        for torrent_file in tm_torrent.get_files():
            if torrent_file.size < self.CONFIG["MEDIA_MIN_SIZE"]:
                continue

            if torrent_file.name.split(".")[-1] not in self.CONFIG["MEDIA_EXT"]:
                continue

            if "trailer" in torrent_file.name.lower():
                continue

            is_valid_path = movie.is_valid_path(torrent_file.name)
            if is_valid_path:
                return torrent_file.name

        raise FileNotFoundError(f"didn't find expected media file in {tm_torrent}")
