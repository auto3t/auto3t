"""all api views"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from autot.models import (
    ActionLog,
    AutotScheduler,
    SearchWord,
    SearchWordCategory,
    Torrent,
)
from autot.src.search import Jackett
from autot.serializers import (
    ActionLogSerializer,
    SchedulerSeralizer,
    SearchWordSerializer,
    SearchWordCategorySerializer,
    TorrentSerializer,
)


class ActionLogView(viewsets.ReadOnlyModelViewSet):
    """action log views"""

    serializer_class = ActionLogSerializer
    queryset = ActionLog.objects.all().order_by("-timestamp")


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


class SchedulerViewSet(viewsets.ModelViewSet):
    """scheduler"""

    serializer_class = SchedulerSeralizer
    queryset = AutotScheduler.objects.all()
