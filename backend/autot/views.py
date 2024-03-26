"""all api views"""

from django.conf import settings
from django.http import Http404, FileResponse
from rest_framework import viewsets

from autot.models import TVShow, TVSeason, TVEpisode, Torrent
from autot.serializers import (
    TorrentSerializer,
    TVEpisodeSerializer,
    TVSeasonSerializer,
    TVShowSerializer,
)


class TorrentViewSet(viewsets.ReadOnlyModelViewSet):
    """get torrent/s"""

    serializer_class = TorrentSerializer
    queryset = Torrent.objects.all()


class ShowViewSet(viewsets.ReadOnlyModelViewSet):
    """get tv show/s"""

    serializer_class = TVShowSerializer
    queryset = TVShow.objects.all()


class SeasonViewSet(viewsets.ReadOnlyModelViewSet):
    """get tv seasons/s"""

    serializer_class = TVSeasonSerializer
    queryset = TVSeason.objects.all().order_by("-number")

    def get_queryset(self):
        """implement filter"""
        show_id = self.request.GET.get("show")
        if show_id:
            return self.queryset.filter(show_id=show_id)

        return self.queryset


class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """get tv episode/s"""

    serializer_class = TVEpisodeSerializer
    queryset = TVEpisode.objects.all()


def get_image(request, folder, filename):
    """temporary solution, get image from filesystem"""
    path = settings.MEDIA_ROOT / "images" / folder / filename
    if not path.exists():
        raise Http404("Image not found")

    return FileResponse(open(path, "rb"), content_type="image/jpeg")
