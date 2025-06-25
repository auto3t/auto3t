"""all api views"""

import django_rq
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from autot.models import ActionLog, AutotScheduler, SearchWord, SearchWordCategory, TargetBitrate, Torrent, get_logs
from autot.serializers import (
    ActionLogSerializer,
    SchedulerSeralizer,
    SearchWordCategorySerializer,
    SearchWordSerializer,
    TargetBitrateSerializer,
    TorrentSerializer,
)
from autot.src.search import Jackett
from autot.static import TASK_OPTIONS


class StandardResultsSetPagination(PageNumberPagination):
    """define custom paginateion"""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000


class ActionLogView(viewsets.ReadOnlyModelViewSet):
    """action log views"""

    serializer_class = ActionLogSerializer
    queryset = ActionLog.objects.all().order_by("-timestamp")
    pagination_class = StandardResultsSetPagination


class SearchWordCategoryView(viewsets.ModelViewSet):
    """search word categories"""

    serializer_class = SearchWordCategorySerializer
    queryset = SearchWordCategory.objects.all()


class SearchWordView(viewsets.ModelViewSet):
    """search words"""

    serializer_class = SearchWordSerializer
    queryset = SearchWord.objects.all().order_by("category__name")


class TargetBitrateView(viewsets.ModelViewSet):
    """target bitrate"""

    serializer_class = TargetBitrateSerializer
    queryset = TargetBitrate.objects.all().order_by("bitrate")


class TorrentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """get torrent/s"""

    serializer_class = TorrentSerializer
    queryset = Torrent.objects.all()

    def update(self, request, *args, **kwargs):
        """handle update"""
        from autot.src.download import Transmission

        instance = self.get_object()
        data = request.data

        if "torrent_state" not in data:
            message = {"error": "One or more fields cannot be updated."}
            return Response(message, status=400)

        torrent_state = data.get("torrent_state")
        if torrent_state != "i":
            message = {"error": "torrent_state can only be changed to 'i'"}

        updated_torrent = Transmission().cancel(instance)
        serializer = self.get_serializer(updated_torrent)

        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def search(self, request, **kwargs):
        """free search, this is slow"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        search_term = data.get("search_term")
        if not search_term:
            return Response({"message": "missing search_term"}, status=400)

        category = data.get("category")
        if not category:
            return Response({"message": "missing category"}, status=400)

        results = Jackett().free_search(search_term, category=category)
        return Response(results)

    @action(detail=True, methods=["get"])
    def actionlog(self, request, **kwargs):
        """get torrent action logs"""
        torrent = self.get_object()
        action_logs = get_logs(torrent)
        if action_logs:
            serializer = ActionLogSerializer(action_logs, many=True)
            return Response(serializer.data)
        return Response([])


class SchedulerViewSet(viewsets.ModelViewSet):
    """scheduler"""

    serializer_class = SchedulerSeralizer
    queryset = AutotScheduler.objects.all()

    @action(detail=True, methods=["get"])
    def actionlog(self, request, **kwargs):
        """get schedule action logs"""
        schedule = self.get_object()
        action_logs = get_logs(schedule)
        if action_logs:
            serializer = ActionLogSerializer(action_logs, many=True)
            return Response(serializer.data)
        return Response([])


class TaskView(APIView):
    """start new task"""

    def get(self, request):
        """get task options"""
        return Response(TASK_OPTIONS)

    def post(self, request):
        """start new task"""
        job = request.data.get("job")
        if not job:
            return Response({"message": "missing job key"}, status=400)

        task = None
        for task_option in TASK_OPTIONS:
            if task_option["job"] == job:
                task = task_option

        if not task:
            return Response({"message": "invalid job"}, status=400)

        queue = django_rq.get_queue(task["queue"])
        job = queue.enqueue(task["job"])

        response = {
            "id": job.id,
            "job": job.func_name,
            "enqueued_at": job.enqueued_at.isoformat(),
        }

        return Response(response)
