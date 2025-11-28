"""build tv person, expected to be called from async queue"""

from autot.models import log_change
from people.models import Person
from people.src.cross_match import match_t_m
from tv.src.tv_maze_client import TVMaze


class TVPerson:
    """get person from tvmaze"""

    def __init__(self, tvmaze_person_id):
        self.tvmaze_person_id = tvmaze_person_id

    def get_or_create(self):
        """get person or create"""
        person = None
        try:
            person = Person.objects.get(tvmaze_id=self.tvmaze_person_id)
        except Person.DoesNotExist:
            pass

        if person:
            return person

        response = self._fetch_remote_person()
        person_data = self._parse_person(response)
        moviedb_person_id = match_t_m(person_data["name"])

        if moviedb_person_id:
            try:
                person = Person.objects.get(the_moviedb_id=moviedb_person_id)
                person.tvmaze_id = self.tvmaze_person_id
                person.save()
            except Person.DoesNotExist:
                pass

            if person:
                return person

            person_data["the_moviedb_id"] = moviedb_person_id

        person = Person.objects.create(**person_data)
        image_url = self._get_image_url(response)
        if image_url:
            person.update_image_person(image_url=image_url)

        return person

    def refresh(self):
        """refresh tv person"""
        person = Person.objects.get(tvmaze_id=self.tvmaze_person_id)
        response = self._fetch_remote_person()
        person_data = self._parse_person(response)

        if not person.name == person_data["name"]:
            old_value = person.name
            person.name = person_data["name"]
            person.save()
            log_change(person, "u", field_name="name", old_value=old_value, new_value=person_data["name"])

        image_url = self._get_image_url(response)
        if image_url:
            person.update_image_person(image_url=image_url)

    def _fetch_remote_person(self):
        """fetch person from tvmaze"""
        url = f"people/{self.tvmaze_person_id}"
        response = TVMaze().get(url)

        if not response:
            raise ValueError

        return response

    def _parse_person(self, response: dict) -> dict:
        """parse person data"""
        person_data = {
            "name": response["name"],
            "tvmaze_id": response["id"],
            "metadata_src": "t",
        }

        return person_data

    def _get_image_url(self, response) -> str | None:
        """get image url"""
        image = response["image"]
        if not image:
            return None

        return image.get("original")
