"""all reoccuring tasks"""

from django_rq import job
from autot.src.show import TVMazeShow


@job("show")
def refresh_show(remote_server_id: str) -> None:
    """job to refresh a single show"""
    TVMazeShow(show_id=remote_server_id).validate()
