"""movie DB collection"""

import json

from artwork.models import Artwork
from autot.models import log_change
from autot.src.redis_con import AutotRedis
from movie.models import Collection, Movie
from movie.serializers import MovieMissingSerializer
from movie.src.movie import MovieDBMovie
from movie.src.movie_db_client import MovieDB


class MovieDBCollection:
    """interact with movie DB collections"""

    def __init__(self, the_moviedb_id: str):
        self.the_moviedb_id = the_moviedb_id

    def validate(self, tracking: bool):
        """validate collection"""
        collection = self.get_collection(tracking)
        self.add_movies(collection)
        if collection.tracking:
            self.track_movies(collection)

    def get_collection(self, tracking: bool) -> Collection:
        """get collection"""
        response = self._get_remote_collection()
        collection_data = self._parse_collection(response)
        poster_path = response.get("poster_path")

        try:
            collection = Collection.objects.get(the_moviedb_id=self.the_moviedb_id)
        except Collection.DoesNotExist:
            collection = Collection.objects.create(**collection_data)
            if poster_path:
                image_url = self._get_image_url(poster_path)
                collection.image_collection = Artwork(image_url=image_url)
                collection.image_collection.save()

            collection.tracking = tracking
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
        Movie.objects.filter(the_moviedb_id__in=collection.the_moviedb_ids).update(collection=collection)

    def _get_remote_collection(self) -> dict:
        """get collection"""
        url = f"collection/{self.the_moviedb_id}"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_collection(self, response: dict) -> dict:
        """parse API response for collection"""
        collection_data = {
            "the_moviedb_id": str(response["id"]),
            "name": response["name"],
            "description": response["overview"],
            "the_moviedb_ids": [str(i["id"]) for i in response["parts"]],
        }
        return collection_data

    def _get_image_url(self, moviedb_file_path: str) -> str:
        """build URL from snipped"""
        return f"https://image.tmdb.org/t/p/original{moviedb_file_path}"

    def track_movies(self, collection):
        """add missing movies in collection"""
        from movie.tasks import import_movie

        missing_ids = CollectionMissing(collection).get_missing_ids()
        for the_moviedb_id in missing_ids:
            import_movie.delay(the_moviedb_id=the_moviedb_id)


class CollectionMissing:
    """missing lookup from collection"""

    REDIS_PREFIX: str = "movie:missing"
    REDIS_EXPIRE: int = 24 * 60 * 60

    def __init__(self, collection: Collection):
        self.collection = collection

    def get_missing_ids(self):
        """get missing ids in collection"""
        have = set(Movie.objects.filter(collection=self.collection).values_list("the_moviedb_id", flat=True))
        missing_ids = set(self.collection.the_moviedb_ids) - have

        return missing_ids

    def get_missing(self):
        """get missing"""
        missing_ids = self.get_missing_ids()

        missing = []

        for the_moviedb_id in missing_ids:
            movie_data = self.get_cached(the_moviedb_id)
            if movie_data:
                missing.append(movie_data)
                continue

            movie_data = self.get_remote(the_moviedb_id)
            self.set_cache(movie_data)
            missing.append(movie_data)

        missing_sorted = sorted(missing, key=lambda d: (d.get("release_date") is None, d.get("release_date")))

        return missing_sorted

    def get_cached(self, the_moviedb_id: str) -> dict | None:
        """get cached"""
        key = f"{self.REDIS_PREFIX}:{the_moviedb_id}"
        cached = AutotRedis().get_message(key)
        if not cached:
            return None

        serializer = MovieMissingSerializer(json.loads(cached))
        return serializer.data

    def set_cache(self, movie_data: dict) -> None:
        """set cached"""
        key = f"{self.REDIS_PREFIX}:{movie_data['the_moviedb_id']}"
        messages = {}
        messages[key] = json.dumps(movie_data)
        AutotRedis().set_messages(messages, expire=self.REDIS_EXPIRE)

    def get_remote(self, the_moviedb_id: str):
        """get from remote"""

        handler = MovieDBMovie(the_moviedb_id)
        response = handler.get_remote_movie()
        movie_data = handler.parse_movie(response)

        poster_path = response.get("poster_path")
        if poster_path:
            movie_data["image_url"] = handler.get_image_url(poster_path)
        else:
            movie_data["image_url"] = None

        serializer = MovieMissingSerializer(data=movie_data)
        serializer.is_valid(raise_exception=True)

        return serializer.data
