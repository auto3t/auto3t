"""build tv person, expected to be called from async queue"""

from people.models import Person
from tv.src.tv_maze_client import TVMaze


class TVPerson:
    """get person from tvmaze"""

    def __init__(self, tvmaze_person_id):
        self.tvmaze_person_id = tvmaze_person_id

    def get_or_create(self):
        """get person or create"""
        try:
            person = Person.objects.get(tvmaze_id=self.tvmaze_person_id)
        except Person.DoesNotExist:
            response = self._fetch_remote_person()
            person_data = self._parse_person(response)
            person = Person.objects.create(**person_data)
            image_url = self._get_image_url(response)
            if image_url:
                person.update_image_person(image_url=image_url)

        return person

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
        }

        return person_data

    def _get_image_url(self, response) -> str | None:
        """get image url"""
        image = response["image"]
        if not image:
            return None

        return image.get("original")
