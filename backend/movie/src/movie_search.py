"""search for movies on remote"""

from urllib import parse
from movie.src.movie_db_client import MovieDB
from movie.models import Movie


class MovieId:
    """identify movie"""

    def search(self, query_raw: str) -> list[dict] | None:
        """search in api"""
        query_encoded = parse.quote(query_raw)
        options = self.get_options(query_encoded)

        return options

    def get_options(self, query_encoded) -> list[dict] | None:
        """get list of matching options"""
        url = f"search/movie?query={query_encoded}&page=1"
        response = MovieDB().get(url)
        if not response:
            return None

        local_ids = {i.remote_server_id: i.id for i in Movie.objects.all()}
        options = [self._parse_result(result, local_ids) for result in response["results"]]

        return options

    def _parse_result(self, result: dict, local_ids: dict[str, int]) -> dict:
        """parse single result"""
        movide_data = {
            "id": result["id"],
            "local_id": local_ids.get(str(result["id"])),
            "name": result["original_title"],
            "url": f"https://www.themoviedb.org/movie/{result['id']}",
            "genres": result["genre_ids"],
            "status": result["status"],
            "summary": result["overview"],
            "tagline": result["tagline"],
        }

        if "poster_path" in result:
            image_url = f"http://image.tmdb.org/t/p/original{result['poster_path']}"
            movide_data.update({"image": image_url})

        if "release_date" in result:
            movide_data.update({"release_date": result["release_date"]})

        return movide_data
