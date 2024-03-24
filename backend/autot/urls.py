"""all api urls"""

from django.urls import path

from autot import views


urlpatterns = [
    path("", views.APIRootView.as_view(), name="api-root"),
    path("torrent/", views.TorrentView.as_view(), name="torrent-list"),
    path("show/", views.TVShowView.as_view(), name="show-list"),
    path("season/", views.TVSeasonView.as_view(), name="season-list"),
    path("episode/", views.TVEpisodeView.as_view(), name="episode-list"),
    path("images/<str:folder>/<str:filename>", views.get_image, name="image-view"),
]
