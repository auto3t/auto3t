"""all movie api urls"""

from django.urls import path

from rest_framework.routers import DefaultRouter
from movie import views

router = DefaultRouter()

urlpatterns = router.urls

urlpatterns.extend(
    [
        path("remote-search", views.MovieRemoteSearch.as_view(), name="movie-remote-search"),
    ]
)
