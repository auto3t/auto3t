"""all movie views"""

from movie.models import Collection, Movie
from movie.serializers import CollectionSerializer, MovieSerializer
from movie.src.movie_search import MovieId
from movie.tasks import import_movie
from rest_framework import viewsets
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


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = MovieId().search(query)

        return Response(response)
