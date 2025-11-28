"""all generic reoccuring tasks"""

import logging
from datetime import timedelta

from artwork.models import Artwork
from artwork.src.cleanup import cleanup_art
from autot.src.archive import Archiver
from autot.src.download import Transmission
from autot.src.media_server import EpisodeIdentify, MediaServerIdentify, MovieIdentify
from django_rq import job
from django_rq.queues import get_queue
from people.src.cleanup import cleanup_people

logger = logging.getLogger("django")


def is_pending(queue_name: str, func_name: str) -> bool:
    """check if a job is already scheduled"""
    queue = get_queue(queue_name)
    all_job_ids = queue.scheduled_job_registry.get_job_ids()
    for job_id in all_job_ids:
        job_queued = queue.fetch_job(job_id)
        if not job_queued:
            continue

        if job_queued.func_name == f"autot.tasks.{func_name}" and job_queued.is_scheduled:
            return True

    return False


@job
def run_archiver() -> None:
    """archive torrents"""
    archived = Archiver().archive()
    if archived:
        queue = get_queue("default")
        queue.enqueue_in(timedelta(seconds=60), media_server_identify)


@job
def download_watcher() -> None:
    """watch download queue"""
    if is_pending("default", "download_watcher"):
        logger.info("download_watcher job is already scheduled, exiting...")
        return

    needs_checking, needs_archiving = Transmission().update_state()
    if needs_checking:
        queue = get_queue("default")
        queue.enqueue_in(timedelta(seconds=60), download_watcher)

    if needs_archiving:
        run_archiver.delay()


@job
def media_server_identify() -> None:
    """identify in media server"""
    EpisodeIdentify().identify()
    MovieIdentify().identify()

    if MediaServerIdentify().needs_matching():
        queue = get_queue("default")
        queue.enqueue_in(timedelta(seconds=60), media_server_identify)


@job("thumbnails")
def download_thumbnails() -> None:
    """download thumbnails"""
    to_download = Artwork.objects.filter(image="")[:10]
    for artwork in to_download:
        artwork.download()

    if Artwork.objects.filter(image="").exists():
        queue = get_queue("thumbnails")
        queue.enqueue_in(timedelta(seconds=10), download_thumbnails)


@job("default")
def cleanup() -> None:
    """cleanup task, call periodically"""
    cleanup_people()
    cleanup_art()
