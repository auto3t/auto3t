"""all auth urls"""

from django.urls import path
from user import views

urlpatterns = [
    path("profile/", views.UserProfileView.as_view(), name="user_profile"),
]
