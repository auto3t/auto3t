"""all reoccuring tasks"""

from django_rq import job
from autot.models import TVShow, TVSeason, TVEpisode
from autot.src.show import TVMazeShow


@job("show")
def refresh_show(remote_server_id: str) -> None:
    """job to refresh a single show"""
    TVMazeShow(show_id=remote_server_id).validate()


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
