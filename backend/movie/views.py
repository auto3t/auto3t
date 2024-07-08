"""all movie views"""

from movie.src.movie_search import MovieId
from rest_framework.views import APIView
from rest_framework.response import Response


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = MovieId().search(query)

        return Response(response)
