"""all tv api views"""

import json

from django.db.models import F, OrderBy, Value
from django.db.models.functions import Replace
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from tv.models import TVEpisode, TVSeason, TVShow
from tv.serializers import TVEpisodeBulkUpdateSerializer, TVEpisodeSerializer, TVSeasonSerializer, TVShowSerializer
from tv.src.show import TVMazeShow
from tv.src.show_search import ShowId
from tv.tasks import import_show, refresh_status

from autot.models import SearchWord, get_logs
from autot.serializers import ActionLogSerializer
from autot.src.redis_con import AutotRedis
from autot.src.search import SearchIndex
from autot.static import TvShowStatus


class ShowViewSet(viewsets.ModelViewSet):
    """get tv show/s"""

    UPDATABLE_FIELDS = {"search_name", "is_active", "search_keywords"}
    VALID_STATUS = [i.name for i in TvShowStatus]

    serializer_class = TVShowSerializer

    def create(self, request, *args, **kwargs):
        """import show"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        tvmaze_id = data.get("tvmaze_id")
        if not tvmaze_id:
            return Response({"message": "missing tvmaze_id key"}, status=400)

        is_active = data.get("is_active")
        if is_active is None:
            return Response({"message": "missing is_active key"}, status=400)

        show = TVMazeShow(tvmaze_id=tvmaze_id).get_show(is_active=is_active)
        import_show.delay(tvmaze_id)
        serializer = TVShowSerializer(show)

        return Response(serializer.data)

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

    def get_queryset(self):
        """implement filters"""
        queryset = queryset = TVShow.objects.annotate(name_sort=Replace(F("name"), Value("The "), Value(""))).order_by(
            "name_sort"
        )

        status = self.request.GET.get("status")
        if status:
            if status not in self.VALID_STATUS:
                message = {"error": f"Invalid status field: {status}."}
                return Response(message, status=400)

            queryset = queryset.filter(status=status)

        is_active = self.request.GET.get("is_active")
        if is_active:
            active_value = is_active.lower() == "true"
            queryset = queryset.filter(is_active=active_value)

        query = self.request.GET.get("q")
        if query:
            queryset = queryset.filter(name__icontains=query)

        return queryset

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

    @action(detail=True, methods=["post"])
    def torrent(self, request, **kwargs) -> Response:
        """overwrite torrent on season"""
        show: TVShow = self.get_object()
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
        magnet, title = SearchIndex().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        show.add_magnet(magnet, title)
        refresh_status.delay()

        return Response(result)

    @action(detail=True, methods=["get"])
    def actionlog(self, request, **kwargs):
        """get show action logs"""
        show = self.get_object()
        action_logs = get_logs(show)
        if action_logs:
            serializer = ActionLogSerializer(action_logs, many=True)
            return Response(serializer.data)
        return Response([])


class SeasonViewSet(viewsets.ModelViewSet):
    """get tv seasons/s"""

    UPDATABLE_FIELDS = {"search_keywords"}
    serializer_class = TVSeasonSerializer
    queryset = TVSeason.objects.all().order_by("-number")

    def get_queryset(self):
        """implement filter"""
        show_id = self.request.GET.get("show")
        if show_id:
            return self.queryset.filter(show_id=show_id)

        return self.queryset

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

    def _update_m2m(self, instance: TVSeason) -> None:
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

    @action(detail=True, methods=["post"])
    def torrent(self, request, **kwargs) -> Response:
        """overwrite torrent on season"""
        season: TVSeason = self.get_object()
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
        magnet, title = SearchIndex().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        season.add_magnet(magnet, title)
        refresh_status.delay()

        return Response(result)

    @action(detail=True, methods=["get"])
    def actionlog(self, request, **kwargs):
        """get season action logs"""
        season = self.get_object()
        action_logs = get_logs(season)
        if action_logs:
            serializer = ActionLogSerializer(action_logs, many=True)
            return Response(serializer.data)
        return Response([])


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
            queryset = queryset.order_by(OrderBy(F(order_by), descending=False, nulls_last=True))
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
                queryset = queryset[: int(limit)]

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

    @action(detail=True, methods=["get"])
    def actionlog(self, request, **kwargs):
        """get episode action logs"""
        episode = self.get_object()
        action_logs = get_logs(episode)
        if action_logs:
            serializer = ActionLogSerializer(action_logs, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=["post"])
    def torrent(self, request, **kwargs) -> Response:
        """overwrite torrent on episode"""
        episode = self.get_object()
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
        magnet, title = SearchIndex().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        episode.add_magnet(magnet, title)
        refresh_status.delay()

        return Response(result)


class ShowRemoteSearch(APIView):
    """search for show"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        response = ShowId().search(query)

        return Response(response)
