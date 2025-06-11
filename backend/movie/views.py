"""all movie views"""

import json

from django.db.models import F, Value
from django.db.models.functions import Replace
from movie.models import Collection, Movie, MovieRelease, MovieReleaseTarget
from movie.serializers import (
    CollectionSerializer,
    MovieReleaseSerializer,
    MovieSerializer,
)
from movie.src.movie_search import MovieId
from movie.tasks import import_movie, refresh_status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from autot.src.redis_con import AutotRedis
from autot.src.search import Jackett
from autot.static import MovieProductionState, MovieReleaseType, MovieStatus


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    """views for collection"""

    serializer_class = CollectionSerializer
    queryset = Collection.objects.all().order_by("name")


class MovieViewSet(viewsets.ModelViewSet):
    """views for movies"""

    VALID_STATUS = [i.name for i in MovieStatus]
    VALID_PRODUCTION = [i.name for i in MovieProductionState]

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

    def get_queryset(self):
        """get movie queryset"""
        queryset = queryset = Movie.objects.annotate(name_sort=Replace(F("name"), Value("The "), Value(""))).order_by(
            "name_sort", "release_date"
        )

        status = self.request.GET.get("status")
        if status:
            if status not in self.VALID_STATUS:
                message = {"error": f"Invalid status field: {status}."}
                return Response(message, status=400)

            queryset = queryset.filter(status=status)

        production_state = self.request.GET.get("production_state")
        if production_state:
            if production_state not in self.VALID_PRODUCTION:
                message = {"error": f"Invalid production state field: {production_state}."}
                return Response(message, status=400)

            queryset = queryset.filter(production_state=production_state)

        query = self.request.GET.get("q")
        if query:
            queryset = queryset.filter(name__icontains=query)

        return queryset

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
        movie: Movie = self.get_object()
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        search_id = data.get("search_id")
        if not search_id:
            return Response({"message": "missing search_id"}, status=400)

        search_result = AutotRedis().get_message(f"search:{search_id}")
        if not search_result:
            return Response({"message": "did not find search result"}, status=404)

        result = json.loads(search_result)
        magnet = Jackett().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        movie.add_magnet(magnet)
        refresh_status.delay()

        return Response(result)


class MovieReleaseTargetView(APIView):
    """handle movie release targets"""

    def get(self, request):
        """get targets, fallback to default"""

        config = MovieReleaseTarget.objects.first()
        if config:
            tracked = set(config.target or [])
        else:
            tracked = set()

        data = [{"id": rt.number, "name": rt.label, "tracking": rt.number in tracked} for rt in MovieReleaseType]
        return Response(data)

    def post(self, request):
        """update target"""

        valid_ids = {rt.number for rt in MovieReleaseType}
        data = request.data.get("target", [])

        if not isinstance(data, list) or not all(isinstance(i, int) for i in data):
            return Response({"error": "Expected a list of integers."}, status=400)

        if not set(data).issubset(valid_ids):
            return Response({"error": "One or more invalid release type IDs."}, status=400)

        config = MovieReleaseTarget.objects.first()
        if config:
            config.target = data
            config.save()
        else:
            config = MovieReleaseTarget.objects.create(target=data)

        tracked_set = set(config.target)
        response_data = [
            {"id": rt.number, "name": rt.label, "tracking": rt.number in tracked_set} for rt in MovieReleaseType
        ]

        return Response(response_data, status=200)


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        if not query:
            return Response({"message": "missing query string"}, status=400)

        response = MovieId().search(query)

        return Response(response)
