"""all api urls"""

from django.urls import path

from rest_framework.routers import DefaultRouter
from autot import views


router = DefaultRouter()
router.register(r"show", views.ShowViewSet, basename="show")
router.register(r"season", views.SeasonViewSet, basename="season")
router.register(r"episode", views.EpisodeViewSet, basename="episode")
router.register(r"torrent", views.TorrentViewSet, basename="torrent")
urlpatterns = router.urls

urlpatterns.append(
    path("images/<str:folder>/<str:filename>", views.get_image, name="image-view"),
)
