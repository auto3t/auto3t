"""movie import functionality"""

from datetime import date

from artwork.models import Artwork
from movie.models import Collection, Movie
from movie.src.movie_db_client import MovieDB


class MovieDBMovie:
    """moviedb remote implementation"""

    def __init__(self, movie_id: str):
        self.movie_id = movie_id

    def validate(self) -> None:
        """import movie as needed"""
        self.get_movie()

    def get_movie(self) -> Movie:
        """get or create moview"""
        response = self._get_remote_movie()
        movie_data = self._parse_movie(response)
        poster_path = response.get("poster_path")
        collection_id = response.get("belongs_to_collection", {}).get("id")

        try:
            movie = Movie.objects.get(remote_server_id=response["id"])
        except Movie.DoesNotExist:
            movie = Movie.objects.create(**movie_data)
            if poster_path:
                image_url = self._get_image_url(poster_path)
                movie.image_movie = Artwork(image_url=image_url)
                movie.image_movie.save()

            if collection_id:
                collection = self.get_collection(collection_id)
                movie.collection = collection

            movie.save()
            print(f"created new movie: {movie.name}")
            return movie

        fields_changed = False
        for key, value in movie_data.items():
            if getattr(movie, key) != value:
                setattr(movie, key, value)
                print(f"{movie.name}: update [{key}] to [{value}]")
                fields_changed = True

        if fields_changed:
            movie.save()

        if poster_path:
            image_url = self._get_image_url(poster_path)
            movie.update_image_movie(image_url)

        return movie

    def _get_remote_movie(self) -> dict:
        """get movie from api"""
        url = f"movie/{self.movie_id}"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_movie(self, response: dict) -> dict:
        """parse API response for model"""
        movie_data = {
            "remote_server_id": str(response["id"]),
            "name": response["original_title"],
            "description": response["overview"],
            "tagline": response["tagline"],
            "release_date": date.fromisoformat(response["release_date"]),
        }
        return movie_data

    def get_collection(self, collection_id) -> Collection:
        """get collection"""
        response = self._get_remote_collection(collection_id)
        collection_data = self._parse_collection(response)
        poster_path = response.get("poster_path")

        try:
            collection = Collection.objects.get(remote_server_id=collection_id)
        except Collection.DoesNotExist:
            collection = Collection.objects.create(**collection_data)
            if poster_path:
                image_url = self._get_image_url(poster_path)
                collection.image_collection = Artwork(image_url=image_url)
                collection.image_collection.save()

            collection.save()
            print(f"created new collection: {collection.name}")
            return collection

        fields_changed = False
        for key, value in collection_data.items():
            if getattr(collection, key) != value:
                setattr(collection, key, value)
                print(f"{collection.name}: update [{key}] to [{value}]")
                fields_changed = True

        if fields_changed:
            collection.save()

        if poster_path:
            image_collection = self._get_image_url(poster_path)
            collection.update_image_collection(image_collection)

        return collection

    def _get_remote_collection(self, collection_id) -> dict:
        """get collection"""
        url = f"collection/{collection_id}"
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
        }
        return collection_data

    def _get_image_url(self, moviedb_file_path: str) -> str:
        """build URL from snipped"""
        return f"https://image.tmdb.org/t/p/original{moviedb_file_path}"
