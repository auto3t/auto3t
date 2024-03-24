"""all api views"""

from django.conf import settings
from django.http import Http404, FileResponse
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse

from autot.models import TVShow, TVSeason, TVEpisode, Torrent
from autot.serializers import (
    TorrentSerializer,
    TVEpisodeSerializer,
    TVSeasonSerializer,
    TVShowSerializer,
)


class APIRootView(APIView):
    """root api view list all endpoints"""

    def get(self, request, format=None):
        """get request"""
        data = {
            "torrent-list": reverse("torrent-list", request=request, format=format),
            "show-list": reverse("show-list", request=request, format=format),
            "season-list": reverse("season-list", request=request, format=format),
            "episode-list": reverse("episode-list", request=request, format=format),
        }
        return Response(data)


class TorrentView(ListAPIView):
    """torrent api view"""

    queryset = Torrent.objects.all()
    serializer_class = TorrentSerializer


class TVShowView(ListAPIView):
    """tv show api view"""

    queryset = TVShow.objects.all()
    serializer_class = TVShowSerializer


class TVSeasonView(ListAPIView):
    """tv season api view"""

    queryset = TVSeason.objects.all()
    serializer_class = TVSeasonSerializer


class TVEpisodeView(ListAPIView):
    """tv episode api view"""

    queryset = TVEpisode.objects.all()
    serializer_class = TVEpisodeSerializer


def get_image(request, folder, filename):
    """temporary solution, get image from filesystem"""
    path = settings.MEDIA_ROOT / "images" / folder / filename
    if not path.exists():
        raise Http404("Image not found")

    return FileResponse(open(path, "rb"), content_type="image/jpeg")
