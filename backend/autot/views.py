"""all api views"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from autot.models import ActionLog, AutotScheduler, SearchWord, SearchWordCategory, Torrent, get_logs
from autot.serializers import (
    ActionLogSerializer,
    SchedulerSeralizer,
    SearchWordCategorySerializer,
    SearchWordSerializer,
    TorrentSerializer,
)
from autot.src.search import Jackett


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


class TorrentViewSet(viewsets.ReadOnlyModelViewSet):
    """get torrent/s"""

    serializer_class = TorrentSerializer
    queryset = Torrent.objects.all()

    @action(detail=False, methods=["post"])
    def search(self, request, **kwargs):
        """free search, this is slow"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        search_term = data.get("search_term")
        if not search_term:
            return Response({"message": "missing search_term"}, status=400)

        results = Jackett().free_search(search_term, category=5000)
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
