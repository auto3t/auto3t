"""jellyfin integration"""

import logging
from typing import NotRequired, TypedDict

import requests
from autot.models import log_change
from autot.src.config import ConfigType, get_config
from autot.src.redis_con import AutotRedis
from django.conf import settings
from django.db.models.query import QuerySet
from movie.models import Movie
from tv.models import TVEpisode, TVShow

logger = logging.getLogger("django")


class MediaServerItem(TypedDict):
    """describes metadata from mediaserver"""

    media_server_id: str | None
    width: NotRequired[int]
    height: NotRequired[int]
    codec: NotRequired[str]
    fps: NotRequired[float]
    size: NotRequired[int]
    duration: NotRequired[int]
    bitrate: NotRequired[int]


class MediaServerIdentify:
    """base class"""

    JF_ITEM_TYPE: str = ""
    PROVIDER_ID: str = ""

    CONFIG: ConfigType = get_config()
    TIMEOUT: int = 60
    HEADERS: dict[str, str] = {"Authorization": f"MediaBrowser Token={CONFIG['JF_API_KEY']}"}

    @property
    def cache_key(self) -> str:
        """get redis cache key"""
        return f"jf:{self.JF_ITEM_TYPE.lower()}"

    def get_unidentified(self):
        """implement in base class"""
        raise NotImplementedError

    def make_request(self, url, method, data=False):
        """make API request"""

        request_url = f"{self.CONFIG['JF_URL']}/{url}"

        if method == "GET":
            response = requests.get(request_url, headers=self.HEADERS, timeout=self.TIMEOUT)
        elif method == "POST":
            response = requests.post(request_url, data=data, headers=self.HEADERS, timeout=self.TIMEOUT)
        else:
            raise ValueError("invalid jf request method")

        if not response.ok:
            message = f"jf request failed: {response.json()}"
            raise ValueError(message)

        if response.status_code == 204:
            return None

        return response.json()

    def get_jf_data(self) -> dict[str, MediaServerItem]:
        """get all jf episodes"""
        url = f"Items?Recursive=true&IncludeItemTypes={self.JF_ITEM_TYPE}&fields=ProviderIds,MediaSources"
        response = self.make_request(url, "GET")
        jf_items = {}
        for item in response["Items"]:
            sources = item.get("MediaSources")
            if not sources:
                continue

            media_source = sources[0]
            bitrate = media_source.get("Bitrate")
            file_size = media_source.get("Size")
            duration = media_source.get("RunTimeTicks", 0) // 10000000

            media_streams = sources[0].get("MediaStreams")
            if not media_streams:
                continue

            video_streams = [i for i in media_streams if i["Type"] == "Video"]
            if not video_streams:
                continue

            video_stream = video_streams[0]
            stream_meta: MediaServerItem = {
                "media_server_id": item["Id"],
                "width": video_stream.get("Width"),
                "height": video_stream.get("Height"),
                "codec": video_stream.get("Codec"),
                "fps": video_stream.get("AverageFrameRate"),
                "size": file_size,
                "duration": duration,
                "bitrate": bitrate,
            }
            tv_maze_id: str | None = item["ProviderIds"].get(self.PROVIDER_ID)
            if not tv_maze_id:
                continue

            jf_items.update({tv_maze_id: stream_meta})

        AutotRedis().set_hash_messages(self.cache_key, values=jf_items, expire=settings.CACHE_TTL, delete=True)

        return jf_items

    def identify(self):
        """identify movies"""
        jf_items = self.get_jf_data()
        to_id = self.get_unidentified()

        for media_item in to_id:
            if hasattr(media_item, "the_moviedb_id"):
                jf_data = jf_items.get(media_item.the_moviedb_id)
            elif hasattr(media_item, "tvmaze_id"):
                jf_data = jf_items.get(media_item.tvmaze_id)
            else:
                raise NotImplementedError("did not find expected remote ID")

            if not jf_data:
                continue

            old_status = media_item.status
            media_item.media_server_id = jf_data.pop("media_server_id")
            media_item.media_server_meta = jf_data
            media_item.status = "a"
            log_change(
                media_item,
                "u",
                field_name="status",
                old_value=old_status,
                new_value="a",
                comment=f"Found Mediaserver ID: {media_item.media_server_id}",
            )
            media_item.save()

    def needs_matching(self) -> bool:
        """check if movies or episodes need matching"""
        return any(
            [
                TVEpisode.objects.filter(torrent__torrent_state="a", media_server_id__isnull=True).exists(),
                Movie.objects.filter(torrent__torrent_state="a", media_server_id__isnull=True).exists(),
            ]
        )

    def refresh(self, to_refresh: set[str]) -> None:
        """refresh items"""
        if not to_refresh:
            return

        for item_id in to_refresh:
            url = (
                f"Items/{item_id}/Refresh?"
                "metadataRefreshMode=FullRefresh&"
                "imageRefreshMode=FullRefresh&"
                "replaceAllMetadata=true&"
                "replaceAllImages=true"
            )
            self.make_request(url, "POST")


class EpisodeIdentify(MediaServerIdentify):
    """identify episodes"""

    JF_ITEM_TYPE: str = "Episode"
    PROVIDER_ID: str = "TvMaze"

    def get_unidentified(self) -> QuerySet[TVEpisode]:
        """get tv episodes not identified"""
        return TVEpisode.objects.filter(media_server_id__isnull=True)


class ShowIdentify(MediaServerIdentify):
    """identify shows"""

    JF_ITEM_TYPE: str = "Series"
    PROVIDER_ID: str = "TvMaze"

    def get_unidentified(self) -> QuerySet[TVShow]:
        """get shows not identified"""
        return TVShow.objects.filter(media_server_id__isnull=True)

    def get_jf_data(self) -> dict:
        """get all jf episodes, partial result, only for matching"""
        url = f"Items?Recursive=true&IncludeItemTypes={self.JF_ITEM_TYPE}&fields=ProviderIds,MediaSources"
        response = self.make_request(url, "GET")
        jf_items = {}
        for item in response["Items"]:

            tv_maze_id: str | None = item["ProviderIds"].get(self.PROVIDER_ID)
            if not tv_maze_id:
                continue

            show_meta: MediaServerItem = {"media_server_id": item["Id"]}

            jf_items.update({tv_maze_id: show_meta})

        AutotRedis().set_hash_messages(self.cache_key, values=jf_items, expire=settings.CACHE_TTL, delete=True)

        return jf_items


class MovieIdentify(MediaServerIdentify):
    """identify movies"""

    JF_ITEM_TYPE: str = "Movie"
    PROVIDER_ID: str = "Tmdb"

    def get_unidentified(self) -> QuerySet[TVEpisode]:
        """get movies not identified"""
        return Movie.objects.filter(media_server_id__isnull=True)
