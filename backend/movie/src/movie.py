"""movie import functionality"""

from datetime import date, datetime

import django_rq
from artwork.models import Artwork
from movie.models import Movie, MovieRelease
from movie.src.movie_db_client import MovieDB

from autot.models import log_change
from autot.static import MovieProductionState


class MovieDBMovie:
    """moviedb remote implementation"""

    def __init__(self, movie_id: str):
        self.movie_id = movie_id

    def validate(self) -> None:
        """import movie as needed"""
        from movie.tasks import refresh_collection

        movie, collection_id = self.get_movie()
        self.get_releases(movie)

        if collection_id:
            movie_queue = django_rq.get_queue("movie")
            queued = {i.kwargs.get("remote_server_id") for i in movie_queue.get_jobs()}
            if collection_id not in queued:
                refresh_collection.delay(remote_server_id=str(collection_id))

    def get_movie(self) -> tuple[Movie, int | None]:
        """get or create moview"""
        response = self._get_remote_movie()
        movie_data = self._parse_movie(response)
        poster_path = response.get("poster_path")
        collection_id: int | None = (response.get("belongs_to_collection") or {}).get("id")

        try:
            movie = Movie.objects.get(remote_server_id=response["id"])
        except Movie.DoesNotExist:
            movie = Movie.objects.create(**movie_data)
            if poster_path:
                image_url = self._get_image_url(poster_path)
                movie.image_movie = Artwork(image_url=image_url)
                movie.image_movie.save()

            movie.save()
            return movie, collection_id

        fields_changed = False
        for key, value in movie_data.items():
            old_value = getattr(movie, key)
            if old_value != value:
                setattr(movie, key, value)
                log_change(movie, "u", field_name=key, old_value=old_value, new_value=value)
                fields_changed = True

        if fields_changed:
            movie.save()

        if poster_path:
            image_url = self._get_image_url(poster_path)
            movie.update_image_movie(image_url)

        return movie, collection_id

    def _get_remote_movie(self) -> dict:
        """get movie from api"""
        url = f"movie/{self.movie_id}"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_movie(self, response: dict) -> dict:
        """parse API response for model"""
        release_date = date.fromisoformat(response["release_date"]) if response["release_date"] else None
        movie_data = {
            "remote_server_id": str(response["id"]),
            "name": response["original_title"],
            "description": response["overview"],
            "tagline": response["tagline"],
            "release_date": release_date,
            "production_state": self._parse_status(response),
            "runtime": response.get("runtime"),
        }
        return movie_data

    @staticmethod
    def _parse_status(response) -> str:
        """parse status"""
        for key in MovieProductionState:
            if key.value == response["status"]:
                return key.name

        raise ValueError("did not find status choice")

    def _get_image_url(self, moviedb_file_path: str) -> str:
        """build URL from snipped"""
        return f"https://image.tmdb.org/t/p/original{moviedb_file_path}"

    def get_releases(self, movie: Movie):
        """get releases for movie"""
        response = self._get_remote_releases()
        releases = self._parse_releases(response, movie)
        for release_data in releases:
            try:
                release_type = release_data["release_type"]
                movie_release = MovieRelease.objects.get(
                    movie__remote_server_id=self.movie_id, release_type=release_type
                )
            except MovieRelease.DoesNotExist:
                movie_release = MovieRelease.objects.create(**release_data)
                continue

            fields_changed = False
            for key, value in release_data.items():
                old_value = getattr(movie_release, key)
                if old_value != value:
                    log_change(movie_release, "u", field_name=key, old_value=old_value, new_value=value)
                    setattr(movie_release, key, value)
                    fields_changed = True

            if fields_changed:
                movie_release.save()

    def _get_remote_releases(self) -> dict:
        """get remote releases"""
        url = f"movie/{self.movie_id}/release_dates"
        response = MovieDB().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_releases(self, response: dict, movie: Movie) -> list[dict]:
        """parse releases by type"""
        newest_releases: dict = {}

        for country_release in response["results"]:
            for release_data in country_release["release_dates"]:
                release_type = release_data["type"]
                release_date = datetime.fromisoformat(release_data["release_date"])

                if newest_type := newest_releases.get(release_type):
                    if newest_type["release_date"] < release_date:
                        continue

                release_data = {
                    "movie": movie,
                    "country": country_release["iso_3166_1"],
                    "release_type": release_type,
                    "release_date": release_date,
                    "release_lang": release_data["iso_639_1"],
                    "note": release_data["note"],
                }
                newest_releases[release_type] = release_data

        releases = list(newest_releases.values())

        return releases
