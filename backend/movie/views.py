"""all movie views"""

import json

from autot.src.redis_con import AutotRedis
from autot.src.search import Jackett
from movie.models import Collection, Movie, MovieRelease
from movie.serializers import CollectionSerializer, MovieReleaseSerializer, MovieSerializer
from movie.src.movie_search import MovieId
from movie.tasks import import_movie
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    """views for collection"""

    serializer_class = CollectionSerializer
    queryset = Collection.objects.all().order_by("name")


class MovieViewSet(viewsets.ModelViewSet):
    """views for movies"""

    serializer_class = MovieSerializer
    queryset = Movie.objects.all().order_by("name")

    def create(self, request, *args, **kwargs):
        """import show"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        remote_server_id = data.get("remote_server_id")
        if not remote_server_id:
            return Response({"message": "missing remote_server_id key"}, status=400)

        job = import_movie.delay(remote_server_id)
        message = {
            "id": job.id,
            "message": f"movie import task started: {remote_server_id}",
            "time": job.enqueued_at.isoformat(),
        }

        return Response(message)

    @action(detail=True, methods=["get"])
    def releases(self, request, **kwargs):
        """get movie release"""
        movie = self.get_object()
        movie_releases = MovieRelease.objects.filter(movie=movie)
        if movie_releases:
            serializer = MovieReleaseSerializer(movie_releases, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=["post"])
    def torrent(self, request, **kwargs) -> Response:
        """overwrite torrent on episode"""
        movie = self.get_object()
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        search_id = data.get("search_id")
        if not data:
            return Response({"message": "missing search_id"}, status=400)

        search_result = AutotRedis().get_message(f"search:{search_id}")
        if not search_result:
            return Response({"message": "did not find search result"}, status=404)

        result = json.loads(search_result)
        magnet = Jackett().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        movie.add_magnet(magnet)

        return Response(result)


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = MovieId().search(query)

        return Response(response)
