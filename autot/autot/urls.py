"""all api urls"""

from django.urls import path

from autot import views


urlpatterns = [
    path("show/", views.TVShowView.as_view(), name="TVShow views"),
]
