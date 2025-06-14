"""movie DB collection"""

from artwork.models import Artwork
from movie.models import Collection, Movie
from movie.src.movie_db_client import MovieDB

from autot.models import log_change


class MovieDBCollection:
    """interact with movie DB collections"""

    def __init__(self, collection_id: str):
        self.collection_id = collection_id

    def validate(self):
        """validate collection"""
        collection = self.get_collection()
        self.add_movies(collection)

    def get_collection(self) -> Collection:
        """get collection"""
        response = self._get_remote_collection()
        collection_data = self._parse_collection(response)
        poster_path = response.get("poster_path")

        try:
            collection = Collection.objects.get(remote_server_id=self.collection_id)
        except Collection.DoesNotExist:
            collection = Collection.objects.create(**collection_data)
            if poster_path:
                image_url = self._get_image_url(poster_path)
                collection.image_collection = Artwork(image_url=image_url)
                collection.image_collection.save()

            collection.save()
            return collection

        fields_changed = False
        for key, value in collection_data.items():
            old_value = getattr(collection, key)
            if old_value != value:
                log_change(collection, "u", field_name=key, old_value=old_value, new_value=value)
                setattr(collection, key, value)
                fields_changed = True

        if fields_changed:
            collection.save()

        if poster_path:
            image_collection = self._get_image_url(poster_path)
            collection.update_image_collection(image_collection)

        return collection

    def add_movies(self, collection) -> None:
        """add movies to collection"""
        Movie.objects.filter(remote_server_id__in=collection.movie_ids).update(collection=collection)

    def _get_remote_collection(self) -> dict:
        """get collection"""
        url = f"collection/{self.collection_id}"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_collection(self, response: dict) -> dict:
        """parse API response for collection"""
        collection_data = {
            "remote_server_id": str(response["id"]),
            "name": response["name"],
            "description": response["overview"],
            "movie_ids": [str(i["id"]) for i in response["parts"]],
        }
        return collection_data

    def _get_image_url(self, moviedb_file_path: str) -> str:
        """build URL from snipped"""
        return f"https://image.tmdb.org/t/p/original{moviedb_file_path}"
