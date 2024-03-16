"""all api views"""

from rest_framework.views import APIView
from rest_framework.response import Response

from autot.models import TVShow, TVSeason, TVEpisode
from autot.serializers import TVShowSerializer, TVSeasonSerializer, TVEpisodeSerializer


class TVShowView(APIView):
    """tv show api view"""

    def get(self, request):
        """handle get request"""
        queryset = TVShow.objects.all()
        serializer = TVShowSerializer(queryset, many=True)

        return Response(serializer.data)


class TVSeasonView(APIView):
    """tv season api view"""

    def get(self, request):
        """handle get request"""
        queryset = TVSeason.objects.all()
        serializer = TVSeasonSerializer(queryset, many=True)

        return Response(serializer.data)


class TVEpisodeView(APIView):
    """tv episode api view"""

    def get(self, request):
        """handle get request"""
        queryset = TVEpisode.objects.all()
        serializer = TVEpisodeSerializer(queryset, many=True)

        return Response(serializer.data)
