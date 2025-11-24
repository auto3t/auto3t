"""all api views"""

import django_rq
from django.conf import settings
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from user.models import UserProfile

from autot.models import (
    ActionLog,
    AppConfig,
    AutotScheduler,
    SearchWord,
    SearchWordCategory,
    TargetBitrate,
    Torrent,
    get_logs,
)
from autot.serializers import (
    ActionLogSerializer,
    AppConfigSerializer,
    SchedulerSeralizer,
    SearchWordCategorySerializer,
    SearchWordSerializer,
    TargetBitrateSerializer,
    TorrentSerializer,
)
from autot.src.search import SearchIndex
from autot.static import TASK_OPTIONS


class StandardResultsSetPagination(PageNumberPagination):
    """define custom paginateion"""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000


class ActionLogView(viewsets.ReadOnlyModelViewSet):
    """action log views"""

    serializer_class = ActionLogSerializer
    queryset = ActionLog.objects.none()
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """get queryset with filters"""

        model_name = self.request.query_params.get("content_type")
        object_id = self.request.query_params.get("object_id")
        recursive = self.request.query_params.get("recursive", "false").lower() == "true"

        if model_name and object_id:
            return ActionLog.get_comments(model_name, object_id, recursive=recursive).order_by("-timestamp")

        return ActionLog.objects.all().order_by("-timestamp")


class SearchWordCategoryView(viewsets.ModelViewSet):
    """search word categories"""

    serializer_class = SearchWordCategorySerializer
    queryset = SearchWordCategory.objects.all()


class SearchWordView(viewsets.ModelViewSet):
    """search words"""

    serializer_class = SearchWordSerializer
    queryset = SearchWord.objects.none().order_by("category__name")

    def get_queryset(self):
        """filter queryset"""
        queryset = SearchWord.objects.all().order_by("category__name")
        exclude_default = self.request.GET.get("exclude-default")
        if exclude_default == "true":
            return queryset.filter(movie_default=False, tv_default=False)

        return queryset


class TargetBitrateView(viewsets.ModelViewSet):
    """target bitrate"""

    serializer_class = TargetBitrateSerializer
    queryset = TargetBitrate.objects.all().order_by("bitrate")


class AppConfigView(APIView):
    """appconfig, single row"""

    def get(self, request, *args, **kwargs):
        """get or create appconfig"""
        app_config, _ = AppConfig.objects.get_or_create(single_lock=1)
        response = AppConfigSerializer(app_config).data

        return Response(response)

    def post(self, request):
        """update with a get or create"""
        app_config, _ = AppConfig.objects.get_or_create(single_lock=1)
        serializer = AppConfigSerializer(app_config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


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

        results = SearchIndex().free_search(search_term, category=category)
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


class QueueProgress(APIView):
    """get backend queue processing state"""

    def get(self, request, *args, **kwargs):
        """get job count"""

        total_pending = 0

        for queue_name in settings.RQ_QUEUES.keys():
            queue = django_rq.get_queue(queue_name)
            pending = queue.count + queue.started_job_registry.count + queue.scheduled_job_registry.count
            total_pending += pending

        return Response({"pending_jobs": total_pending})


class AppStatusView(APIView):
    """app status, public endpoint"""

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """get app status"""

        response = {"user_exists": UserProfile.objects.exists()}

        return Response(response)
