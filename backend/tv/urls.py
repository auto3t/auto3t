"""all tv api urls"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from tv import views

router = DefaultRouter()
router.register(r"show", views.ShowViewSet, basename="show")
router.register(r"season", views.SeasonViewSet, basename="season")
router.register(r"episode", views.EpisodeViewSet, basename="episode")

urlpatterns = router.urls

urlpatterns.extend(
    [
        path("remote-search", views.ShowRemoteSearch.as_view(), name="remote-search"),
    ]
)
