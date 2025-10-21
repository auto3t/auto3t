"""build movie person, expected to be called from async queue"""

from movie.src.movie_db_client import MovieDB
from people.models import Person


class MovieDBPerson:
    """handle person indexing in movie db"""

    def __init__(self, moviedb_person_id: str):
        self.moviedb_person_id = moviedb_person_id

    def get_or_create(self):
        """get or create person"""
        try:
            person = Person.objects.get(the_moviedb_id=self.moviedb_person_id)
        except Person.DoesNotExist:
            response = self._fetch_remote_person()
            person_data = self._parse_person(response)
            person = Person.objects.create(**person_data)
            if response.get("profile_path"):
                image_url = self._get_image_url(response["profile_path"])
                person.update_image_person(image_url=image_url)

        return person

    def _fetch_remote_person(self):
        """fetch person from remote"""
        url = f"person/{self.moviedb_person_id}"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_person(self, response: dict) -> dict:
        """parse person"""
        person_data = {
            "name": response["name"],
            "the_moviedb_id": self.moviedb_person_id,
            "imdb_id": response.get("imdb_id"),
        }

        return person_data

    def _get_image_url(self, moviedb_file_path: str) -> str:
        """build URL from snipped"""
        return f"https://image.tmdb.org/t/p/original{moviedb_file_path}"
