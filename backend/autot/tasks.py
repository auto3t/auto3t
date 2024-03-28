"""all reoccuring tasks"""

from datetime import timedelta

from django_rq import job
from django_rq.queues import get_queue
from autot.models import TVShow, TVSeason, TVEpisode
from autot.src.archive import Archiver
from autot.src.download import Transmission
from autot.src.episode import EpisodeStatus
from autot.src.show import TVMazeShow


@job("show")
def refresh_show(remote_server_id: str) -> None:
    """job to refresh a single show"""
    TVMazeShow(show_id=remote_server_id).validate()


@job("show")
def run_archiver() -> None:
    """archive torrents"""
    Archiver().archive()


@job("show")
def download_watcher() -> None:
    """watch download queue"""
    needs_checking, needs_archiving = Transmission().update_state()
    if needs_checking:
        queue = get_queue("show")
        queue.enqueue_in(timedelta(seconds=60), download_watcher)

    if needs_archiving:
        run_archiver.delay()


@job("show")
def refresh_status() -> None:
    """refresh status of all"""
    found_magnets = EpisodeStatus().refresh()
    if found_magnets:
        Transmission().add_all()
        queue = get_queue("show")
        queue.enqueue_in(timedelta(seconds=60), download_watcher)


@job("thumbnails")
def download_thumbnail(remote_server_id: str, model_type: str) -> None:
    """download thumbnail"""
    handler = None
    if model_type == "show":
        handler = TVShow.objects.get(remote_server_id=remote_server_id)
    elif model_type == "season":
        handler = TVSeason.objects.get(remote_server_id=remote_server_id)
    elif model_type == "episode":
        handler = TVEpisode.objects.get(remote_server_id=remote_server_id)

    if not handler:
        raise ValueError

    handler.download_image()
