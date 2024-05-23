"""all api urls"""

from django.urls import path

from rest_framework.routers import DefaultRouter
from autot import views


router = DefaultRouter()
router.register(r"show", views.ShowViewSet, basename="show")
router.register(r"season", views.SeasonViewSet, basename="season")
router.register(r"episode", views.EpisodeViewSet, basename="episode")
router.register(r"torrent", views.TorrentViewSet, basename="torrent")
router.register(r"keyword-category", views.SearchWordCategoryView, basename="keyword-category")
router.register(r"keyword", views.SearchWordView, basename="keyword")
urlpatterns = router.urls

urlpatterns.extend(
    [
        path("remote-search", views.ShowRemoteSearch.as_view(), name="remote-search"),
    ]
)
