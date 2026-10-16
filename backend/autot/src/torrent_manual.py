"""torrent manual handling across types"""

import json
from typing import TYPE_CHECKING, TypedDict

from autot.src.redis_con import AutotRedis
from autot.src.search import SearchIndex

if TYPE_CHECKING:
    from movie.models import Movie
    from tv.models import TVEpisode, TVSeason, TVShow


class ManualAddFormat(TypedDict):
    """manual add return format fields"""

    title: str | None
    magnet: str


def add_manual_torrent(instance: "TVEpisode | TVSeason | TVShow | Movie", request_data: dict | None) -> ManualAddFormat:
    """add manual torrent"""

    if not request_data or not isinstance(request_data, dict):
        raise ValueError("missing request body")

    search_id = request_data.get("search_id")
    manual_magnet = request_data.get("manual_magnet")

    if not search_id and not manual_magnet:
        raise ValueError("missing search_id or manual_magnet")

    title = None
    magnet = manual_magnet or None

    if search_id:
        search_result = AutotRedis().get_message(f"search:{search_id}")
        if not search_result:
            raise ValueError("did not find search result")

        result = json.loads(search_result)
        magnet, title = SearchIndex().extract_magnet(result)

    if not magnet:
        raise ValueError("failed to extract magnet url")

    instance.add_magnet(magnet, title)

    return ManualAddFormat(title=title, magnet=magnet)
