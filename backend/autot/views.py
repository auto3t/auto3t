"""all api views"""

from rest_framework import viewsets
from rest_framework.decorators import action
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
from autot.tasks import import_show
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
    queryset = SearchWord.objects.all().order_by("word")


class TorrentViewSet(viewsets.ReadOnlyModelViewSet):
    """get torrent/s"""

    serializer_class = TorrentSerializer
    queryset = Torrent.objects.all()


class ShowViewSet(viewsets.ModelViewSet):
    """get tv show/s"""

    UPDATABLE_FIELDS = {"search_name", "is_active", "search_keywords"}

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

        job = import_show.delay(remote_server_id)
        message = {
            "id": job.id,
            "message": f"show import task started: {remote_server_id}",
            "time": job.enqueued_at.isoformat()
        }

        return Response(message)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        if set(data.keys()) - self.UPDATABLE_FIELDS:
            message = {"error": "One or more fields cannot be updated."}
            return Response(message, status=400)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)

        if "search_keywords" in data.keys():
            self._update_m2m(instance)
        else:
            self.perform_update(serializer)

        return Response(serializer.data)

    def _update_m2m(self, instance: TVShow) -> None:
        """handle search_keywords"""
        data = self.request.data
        direction = self.request.GET.get("direction")
        ids = [int(i) for i in data["search_keywords"]]
        to_process = SearchWord.objects.filter(id__in=ids)

        if direction == "add":
            for to_add in to_process:
                instance.add_keyword(instance, to_add)

        elif direction == "remove":
            for to_remove in to_process:
                instance.remove_keyword(instance, to_remove)


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
        queryset = TVEpisode.objects.all()
        order_by = self.request.GET.get("order-by")
        if order_by:
            queryset = queryset.order_by(order_by)
        else:
            queryset = queryset.order_by("-number")

        show_id = self.request.GET.get("show")
        if show_id:
            queryset = queryset.filter(season__show=show_id)

        season_id = self.request.GET.get("season")
        if season_id:
            queryset = queryset.filter(season=season_id)

        episode_status = self.request.GET.get("status")
        if episode_status:
            queryset = queryset.filter(status__in=episode_status.split(","))

        limit = self.request.GET.get("limit")
        if limit:
            if limit.isnumeric():
                queryset = queryset[:int(limit)]

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

    @action(detail=True, methods=["get"])
    def next(self, request, **kwargs):
        """get next episode in nav"""
        episode = self.get_object()
        next_episode = episode.get_next()
        if next_episode:
            serializer = TVEpisodeSerializer(next_episode)
            return Response(serializer.data)
        return Response({})

    @action(detail=True, methods=["get"])
    def previous(self, request, **kwargs):
        """get previous episode in nav"""
        episode = self.get_object()
        previous_episode = episode.get_previous()
        if previous_episode:
            serializer = TVEpisodeSerializer(previous_episode)
            return Response(serializer.data)
        return Response({})


class ShowRemoteSearch(APIView):
    """search for show"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = ShowId().search(query)

        return Response(response)
