"""search for person by name"""

from movie.src.movie_db_client import MovieDB
from people.models import Person
from tv.src.tv_maze_client import TVMaze


class PersonSearch:
    """base class"""

    def _get_local_ids(self, id_name):
        """get all local ids to match against"""
        return {i[0]: i[1] for i in Person.objects.all().values_list(id_name, "id")}


class SearchMoviePerson(PersonSearch):
    """search movie person by name"""

    def search(self, query_encoded: str) -> list[dict]:
        """search movie person by name"""
        url = f"search/person?query={query_encoded}"
        response = MovieDB().get(url)
        if not response:
            return []

        local_ids = self._get_local_ids("the_moviedb_id")
        options = [self._parse_result(result, local_ids) for result in response["results"]]

        return options

    def _parse_result(self, result: dict, local_ids: dict[str, int]) -> dict:
        """parse result"""
        person_data = {
            "id": result["id"],
            "local_id": local_ids.get(str(result["id"])),
            "name": result["name"],
            "department": result.get("known_for_department"),
        }

        if result.get("profile_path"):
            image_url = f"http://image.tmdb.org/t/p/original{result['profile_path']}"
            person_data.update({"image": image_url})

        return person_data


class SearchTvPerson(PersonSearch):
    """search person in tvmaze"""

    def search(self, query_encoded: str) -> list[dict]:
        """search for persons"""
        url = f"search/people?q={query_encoded}"
        response = TVMaze().get(url)
        if not response:
            return []

        local_ids = self._get_local_ids("tvmaze_id")
        options = [self._parse_result(result, local_ids) for result in response]

        return options

    def _parse_result(self, result: dict, local_ids: dict[str, int]) -> dict:
        """parse result"""
        person_data = {
            "id": result["person"]["id"],
            "local_id": local_ids.get(str(result["person"]["id"])),
            "name": result["person"]["name"],
            "department": None,
        }

        if result["person"].get("image"):
            person_data.update({"image": result["person"]["image"].get("original")})

        return person_data
