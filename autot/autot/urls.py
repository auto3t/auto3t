"""all api urls"""

from django.urls import path

from autot import views


urlpatterns = [
    path("show/", views.TVShowView.as_view(), name="TVShow views"),
    path("season/", views.TVSeasonView.as_view(), name="TVSeason views"),
    path("episode/", views.TVEpisodeView.as_view(), name="TVEpisode views"),
]
