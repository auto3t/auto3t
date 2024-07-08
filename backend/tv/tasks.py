"""all tv tasks"""

from datetime import timedelta

from django_rq import job
from django_rq.queues import get_queue
from tv.models import TVShow
from tv.src.episode import EpisodeStatus
from tv.src.show import TVMazeShow
from autot.tasks import download_thumbnails, download_watcher, media_server_identify
from autot.src.download import Transmission


@job
def refresh_all_shows() -> None:
    """refresh all active shows"""
    to_refresh = TVShow.objects.filter(is_active=True)
    jobs = []
    queue = get_queue("show")
    for show in to_refresh:
        refresh_job = queue.enqueue(refresh_show, args=(show.remote_server_id,))
        jobs.append(refresh_job)

    if jobs:
        queue.enqueue(refresh_status, depends_on=jobs)
        queue.enqueue(download_thumbnails, depends_on=jobs)


@job("show")
def import_show(remote_server_id: str) -> None:
    """import new show"""
    queue = get_queue("show")
    refresh_job = refresh_show.delay(remote_server_id)
    queue.enqueue(media_server_identify, depends_on=refresh_job)
    download_thumbnails.delay()


@job("show")
def refresh_show(remote_server_id: str) -> None:
    """job to refresh a single show"""
    TVMazeShow(show_id=remote_server_id).validate()


@job("show")
def refresh_status() -> None:
    """refresh status of all"""
    found_magnets = EpisodeStatus().refresh()
    if found_magnets:
        Transmission().add_all()
        queue = get_queue("show")
        queue.enqueue_in(timedelta(seconds=60), download_watcher)
