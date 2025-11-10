"""all people api urls"""

from django.urls import path
from people import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"credit", views.CreditViewSet)
router.register(r"person", views.PersonViewSet)

urlpatterns = router.urls

urlpatterns.extend(
    [
        path("people-search/", views.PersonRemoteSearch.as_view(), name="people-remote-search"),
    ]
)
