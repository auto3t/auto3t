"""all auth urls"""

from authentication import views
from django.urls import path

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogOutView.as_view(), name="logout"),
]
