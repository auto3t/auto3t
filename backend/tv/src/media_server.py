"""jellyfin integration"""

import requests

from django.db.models.query import QuerySet
from tv.models import TVEpisode
from autot.src.config import get_config, ConfigType


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

    def get_jf_ids(self):
        """get all jf episodes"""
        url = "Items?Recursive=true&IncludeItemTypes=Episode&fields=ProviderIds"
        response = self.make_request(url, "GET")

        jf_ids = {i["ProviderIds"]["TvMaze"]: i["Id"] for i in response["Items"] if "TvMaze" in i["ProviderIds"]}

        return jf_ids

    def identify(self):
        """identify episodes in JF"""
        jf_ids = self.get_jf_ids()
        to_id = self.get_unidentified()
        episode_to_update = []
        for episode in to_id:
            jf_id = jf_ids.get(episode.remote_server_id)
            if not jf_id:
                continue

            episode.media_server_id = jf_id
            episode.status = "f"
            episode_to_update.append(episode)

        if not episode_to_update:
            return

        ided = TVEpisode.objects.bulk_update(episode_to_update, ["media_server_id", "status"])
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
