"""all api views"""

from django.conf import settings
from django.http import Http404, FileResponse
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from autot.models import (
    SearchWord,
    SearchWordCategory,
    TVShow,
    TVSeason,
    TVEpisode,
    Torrent,
)
from autot.tasks import refresh_show
from autot.src.show_search import ShowId
from autot.serializers import (
    SearchWordSerializer,
    SearchWordCategorySerializer,
    TorrentSerializer,
    TVEpisodeSerializer,
    TVEpisodeBulkUpdateSerializer,
    TVSeasonSerializer,
    TVShowSerializer,
)


class SearchWordCategoryView(viewsets.ModelViewSet):
    """search word categories"""

    serializer_class = SearchWordCategorySerializer
    queryset = SearchWordCategory.objects.all()


class SearchWordView(viewsets.ModelViewSet):
    """search words"""

    serializer_class = SearchWordSerializer
    queryset = SearchWord.objects.all()


class TorrentViewSet(viewsets.ReadOnlyModelViewSet):
    """get torrent/s"""

    serializer_class = TorrentSerializer
    queryset = Torrent.objects.all()


class ShowViewSet(viewsets.ReadOnlyModelViewSet):
    """get tv show/s"""

    serializer_class = TVShowSerializer
    queryset = TVShow.objects.all().order_by("name")

    def create(self, request, *args, **kwargs):
        """import show"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        remote_server_id = data.get("remote_server_id")
        if not remote_server_id:
            return Response({"message": "missing remote_server_id key"}, status=400)

        job = refresh_show.delay(remote_server_id)
        message = {
            "id": job.id,
            "message": f"show refresh task started: {remote_server_id}",
            "time": job.enqueued_at.isoformat()
        }

        return Response(message)


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


class EpisodeViewSet(viewsets.ModelViewSet):
    """get tv episode/s"""

    def get_serializer_class(self):
        """overwrite serializer for create"""
        if self.action == "create":
            return TVEpisodeBulkUpdateSerializer

        return TVEpisodeSerializer

    def get_queryset(self):
        """implement filters"""
        queryset = TVEpisode.objects.all().order_by("-release_date")
        show_id = self.request.GET.get("show")
        if show_id:
            queryset = queryset.filter(season__show=show_id)

        season_id = self.request.GET.get("season")
        if season_id:
            queryset = queryset.filter(season=season_id)

        episode_status = self.request.GET.get("status")
        if episode_status:
            queryset = queryset.filter(status__in=episode_status.split(","))

        return queryset

    def create(self, request, *args, **kwargs):
        """Bulk update status of episodes"""
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            status = serializer.validated_data.get("status")
            self.get_queryset().update(status=status)
            return Response({"message": "Episodes status updated successfully"})

        return Response(serializer.errors, status=400)


class ShowRemoteSearch(APIView):
    """search for show"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = ShowId().search(query)

        return Response(response)


def get_image(request, folder, filename):
    """temporary solution, get image from filesystem"""
    path = settings.MEDIA_ROOT / "images" / folder / filename
    if not path.exists():
        raise Http404("Image not found")

    return FileResponse(open(path, "rb"), content_type="image/jpeg")
