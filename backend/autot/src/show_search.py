"""search for shows on remote"""

from urllib import parse

from autot.src.client_tvmaze import TVMaze


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

        options = [self.parse_result(i) for i in response]

        return options

    def parse_result(self, result: dict) -> dict:
        """parse single result"""
        result = result["show"]
        show_data = {
            "id": result["id"],
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
