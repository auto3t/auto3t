"""jellyfin integration"""

from typing import TypedDict, NotRequired
import requests

from django.db.models.query import QuerySet
from tv.models import TVEpisode
from autot.models import log_change
from autot.src.config import get_config, ConfigType


class MediaServerItem(TypedDict):
    """describes metadata from mediaserver"""

    media_server_id: NotRequired[str]
    width: int
    height: int
    codec: str
    fps: float
    size: int
    duration: int
    bitrate: int


class MediaServerEpisode:
    """interact with episode in JF"""

    CONFIG: ConfigType = get_config()
    TIMEOUT: int = 60
    HEADERS: dict[str, str] = {"Authorization": f"MediaBrowser Token={CONFIG['JF_API_KEY']}"}
    PROVIDER_NAME: str = "TvMaze"

    def needs_matching(self) -> bool:
        """get archived but not identified"""
        return TVEpisode.objects.filter(
            torrent__torrent_state="a", media_server_id__isnull=True
        ).exists()

    def get_unidentified(self) -> QuerySet[TVEpisode]:
        """get tv episodes not identified"""
        return TVEpisode.objects.filter(media_server_id__isnull=True)

    def get_jf_data(self) -> dict[str, MediaServerItem]:
        """get all jf episodes"""
        url = "Items?Recursive=true&IncludeItemTypes=Episode&fields=ProviderIds,MediaSources"
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
            tv_maze_id = item["ProviderIds"].get("TvMaze")
            if not tv_maze_id:
                continue

            jf_items.update({tv_maze_id: stream_meta})

        return jf_items

    def identify(self) -> None:
        """identify episodes in JF"""
        jf_items = self.get_jf_data()
        to_id = self.get_unidentified()
        episode_to_update = []
        for episode in to_id:
            jf_data = jf_items.get(episode.remote_server_id)
            if not jf_data:
                continue

            old_status = episode.status
            episode.media_server_id = jf_data.pop("media_server_id")
            episode.media_server_meta = jf_data
            episode.status = "f"
            log_change(
                episode,
                "u",
                field_name="status",
                old_value=old_status,
                new_value="f",
                comment=f"Found Mediaserver ID: {episode.media_server_id}",
            )
            episode_to_update.append(episode)

        if not episode_to_update:
            return

        ided = TVEpisode.objects.bulk_update(episode_to_update, ["media_server_id", "media_server_meta", "status"])
        print(f"found jf ids for {ided} episodes")

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

        return response.json()
