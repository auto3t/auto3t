"""artwork urls"""

from artwork import views
from django.urls import path

urlpatterns = [
    path("images/<str:folder>/<str:filename>", views.ImageView.as_view(), name="image-view"),
]
