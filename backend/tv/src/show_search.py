"""search for shows on remote"""

import json
from urllib import parse

from autot.src.config import ConfigType, get_config
from autot.src.media_server import ShowIdentify
from autot.src.redis_con import AutotRedis
from tv.models import TVShow
from tv.src.tv_maze_client import TVMaze


class TVMazeSearch:
    """base class"""

    CONFIG: ConfigType = get_config()

    def get_local_ids(self):
        """get all local ids to match against"""
        return {i[0]: i[1] for i in TVShow.objects.all().values_list("tvmaze_id", "id")}

    def get_jf_ids(self):
        """get ids from JF"""
        cache_key = ShowIdentify().cache_key
        jf_items = AutotRedis().get_hash_message(cache_key)
        if jf_items:
            jf_items = {i[0]: json.loads(i[1]) for i in jf_items.items()}
        else:
            jf_items = ShowIdentify().get_jf_data()

        return jf_items

    def parse_result(self, result: dict, local_ids: dict[str, int], jf_items: dict | None = None) -> dict:
        """parse single result"""
        result = result["show"]
        show_data = {
            "id": result["id"],
            "local_id": local_ids.get(str(result["id"])),
            "media_server_id": None,
            "media_server_url": None,
            "name": result["name"],
            "url": result["url"],
            "genres": result["genres"],
            "status": result["status"],
            "summary": result["summary"],
        }
        if jf_items:
            media_server_id = jf_items.get(str(result["id"]), {}).get("media_server_id")
            if media_server_id:
                base_url = self.CONFIG["JF_PROXY_URL"]
                media_server_url = f"{base_url}/web/#/details?id={media_server_id}"
                show_data.update({"media_server_id": media_server_id, "media_server_url": media_server_url})

        if "premiered" in result:
            show_data.update({"premiered": result["premiered"]})

        if "ended" in result:
            show_data.update({"ended": result["ended"]})

        if "image" in result and result["image"]:
            show_data.update({"image": result["image"].get("original")})

        return show_data


class ShowId(TVMazeSearch):
    """search show in tvmaze"""

    def search(self, query_raw: str) -> list[dict] | None:
        """search in api"""
        query_encoded = parse.quote(query_raw)
        url = f"search/shows?q={query_encoded}"
        response = TVMaze().get(url)
        if not response:
            return None

        local_ids = self.get_local_ids()
        jf_items = self.get_jf_ids()
        options = [self.parse_result(result, local_ids, jf_items) for result in response]

        return options


class ShowPersonSearch(TVMazeSearch):
    """search person cast credits"""

    def search(self, tvmaze_person_id) -> list[dict] | None:
        """get list of show results of person"""
        url = f"people/{tvmaze_person_id}/castcredits?embed=show"
        response = TVMaze().get(url)
        if not response:
            return None

        local_ids = self.get_local_ids()

        options = []
        for show_result in response:
            character_name = show_result["_links"]["character"]["name"]

            option = self.parse_result(show_result["_embedded"], local_ids)
            option["character_name"] = character_name
            options.append(option)

        return options
