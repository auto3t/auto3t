"""all movie views"""

from movie.models import Collection, Movie
from movie.src.movie_search import MovieId
from movie.serializers import CollectionSerializer, MovieSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    """views for collection"""

    serializer_class = CollectionSerializer
    queryset = Collection.objects.all().order_by("name")


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """views for movies"""

    serializer_class = MovieSerializer
    queryset = Movie.objects.all().order_by("name")


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = MovieId().search(query)

        return Response(response)
