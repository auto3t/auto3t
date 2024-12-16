"""all movie tasks"""

from autot.tasks import download_thumbnails, media_server_identify
from django_rq import job
from django_rq.queues import get_queue
from movie.models import Movie
from movie.src.movie import MovieDBMovie


@job
def refresh_all_movies() -> None:
    """refresh all active movies"""
    to_refresh = Movie.objects.filter(is_active=True)
    jobs = []
    queue = get_queue("movie")
    for movie in to_refresh:
        refresh_job = queue.enqueue(refresh_movie, args=(movie.remote_server_id,))
        jobs.append(refresh_job)

    if jobs:
        queue.enqueue(download_thumbnails, depends_on=jobs)


@job("movie")
def import_movie(remote_server_id: str) -> None:
    """import new movie"""
    queue = get_queue("movie")
    refresh_job = refresh_movie.delay(remote_server_id)
    queue.enqueue(media_server_identify, depends_on=refresh_job)
    download_thumbnails.delay()


@job("movie")
def refresh_movie(remote_server_id: str) -> None:
    """job to refresh a single movie"""
    MovieDBMovie(remote_server_id).validate()
