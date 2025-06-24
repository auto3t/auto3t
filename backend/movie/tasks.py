"""all movie tasks"""

from datetime import timedelta

from django_rq import job
from django_rq.queues import get_queue
from movie.models import Movie
from movie.src.collection import MovieDBCollection
from movie.src.movie import MovieDBMovie
from movie.src.movie_status import MovieStatus

from autot.src.download import Transmission
from autot.tasks import download_thumbnails, download_watcher, media_server_identify


@job
def refresh_all_movies() -> None:
    """refresh all active movies"""
    to_refresh = Movie.objects.filter(is_active=True)
    jobs = []
    queue = get_queue("movie")
    for movie in to_refresh:
        refresh_job = queue.enqueue(refresh_movie, args=(movie.the_moviedb_id,))
        jobs.append(refresh_job)

    if jobs:
        queue.enqueue(refresh_status, depends_on=jobs)
        queue.enqueue(download_thumbnails, depends_on=jobs)


@job("movie")
def import_movie(the_moviedb_id: str) -> None:
    """import new movie"""
    queue = get_queue("default")
    refresh_job = refresh_movie.delay(the_moviedb_id)
    queue.enqueue(media_server_identify, depends_on=refresh_job)
    download_thumbnails.delay()


@job("movie")
def refresh_movie(the_moviedb_id: str) -> None:
    """job to refresh a single movie"""
    MovieDBMovie(the_moviedb_id).validate()


@job("movie")
def import_collection(the_moviedb_id: str, tracking: bool = False) -> None:
    """import new collection"""
    refresh_job = refresh_collection.delay(the_moviedb_id=the_moviedb_id, tracking=tracking)
    queue = get_queue("thumbnails")
    queue.enqueue(download_thumbnails, depends_on=refresh_job)


@job("movie")
def refresh_collection(the_moviedb_id: str, tracking: bool = False) -> None:
    """refresh collection"""
    MovieDBCollection(the_moviedb_id=the_moviedb_id).validate(tracking=tracking)


@job("movie")
def refresh_status() -> None:
    """refresh movie status"""
    found_magnets = MovieStatus().refresh()
    if found_magnets:
        Transmission().add_all()
        queue = get_queue("default")
        queue.enqueue_in(timedelta(seconds=60), download_watcher)
