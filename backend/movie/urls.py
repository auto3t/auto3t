"""all movie api urls"""

from django.urls import path
from movie import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"collection", views.CollectionViewSet, basename="collection")
router.register(r"movie", views.MovieViewSet, basename="movie")

urlpatterns = router.urls

urlpatterns.extend(
    [
        path("remote-search", views.MovieRemoteSearch.as_view(), name="movie-remote-search"),
    ]
)
