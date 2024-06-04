"""search for shows on remote"""

from urllib import parse

from tv.models import TVShow
from tv.src.tv_maze_client import TVMaze


class ShowId:
    """search show in tvmaze"""

    def search(self, query_raw: str) -> list[dict] | None:
        """search in api"""
        query_encoded = parse.quote(query_raw)
        options = self.get_options(query_encoded)

        return options

    def get_options(self, query_encoded) -> list[dict] | None:
        """get list of matching options"""
        url = f"search/shows?q={query_encoded}"
        response = TVMaze().get(url)
        if not response:
            return None

        local_ids = {i.remote_server_id: i.id for i in TVShow.objects.all()}
        options = [self.parse_result(result, local_ids) for result in response]

        return options

    def parse_result(self, result: dict, local_ids: dict[str, int]) -> dict:
        """parse single result"""
        result = result["show"]
        show_data = {
            "id": result["id"],
            "local_id": local_ids.get(str(result["id"])),
            "name": result["name"],
            "url": result["url"],
            "genres": result["genres"],
            "status": result["status"],
            "summary": result["summary"],
        }
        if "premiered" in result:
            show_data.update({"premiered": result["premiered"]})

        if "ended" in result:
            show_data.update({"ended": result["ended"]})

        if "image" in result and result["image"]:
            show_data.update({"image": result["image"].get("medium")})

        return show_data
