"""all reoccuring tasks"""

from time import sleep

from autot.models import TVShow
from autot.src.episode import EpisodeStatus
from autot.src.show import TVMazeShow


SLEEP_INTERVAL = 5


def refresh_all_shows():
    """refresh all shows"""
    all_active = TVShow.objects.filter(is_active=True)
    for show in all_active:
        print(f"refresh: {show}")
        TVMazeShow(show_id=show.remote_server_id).validate()
        sleep(SLEEP_INTERVAL)

    EpisodeStatus().refresh()
