"""
attempt cross match between metadata sources
assume single match to be same person, ignore if more than one result
not sure if that is a good idea
"""

from urllib.parse import quote

from movie.src.movie_db_client import MovieDB
from tv.src.tv_maze_client import TVMaze


def match_m_t(moviedb_name: str):
    """attempt match movie person with tv person"""
    url = f"search/people?q={quote(moviedb_name)}"
    response = TVMaze().get(url)
    if not response or not len(response) == 1:
        return None

    tvmaze_person_id = response[0]["person"]["id"]
    return tvmaze_person_id


def match_t_m(tvmaze_name: str, popularity_gt: int = 1):
    """attempt match tv person with movie person"""
    url = f"search/person?query={quote(tvmaze_name)}"
    response = MovieDB().get(url)
    if not response:
        return None

    possible = [i for i in response["results"] if i["popularity"] > popularity_gt]
    if not possible or len(possible) != 1:
        return None

    moviedb_person_id = possible[0]["id"]

    return moviedb_person_id
