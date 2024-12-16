"""artwork urls"""

from django.urls import path

from artwork import views

urlpatterns = [
    path("<str:folder>/<str:filename>", views.ImageView.as_view(), name="image-view"),
]
