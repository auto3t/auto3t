"""all api urls"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from autot import views

router = DefaultRouter()
router.register(r"torrent", views.TorrentViewSet, basename="torrent")
router.register(r"keyword-category", views.SearchWordCategoryView, basename="keyword-category")
router.register(r"keyword", views.SearchWordView, basename="keyword")
router.register(r"targetbitrates", views.TargetBitrateView, basename="targetbitrates")
router.register(r"scheduler", views.SchedulerViewSet, basename="scheduler")
router.register(r"actionlog", views.ActionLogView, basename="actionlog")
urlpatterns = router.urls

urlpatterns.extend(
    [
        path("appconfig/", views.AppConfigView.as_view(), name="appconfig"),
        path("tasks/", views.TaskView.as_view(), name="tasks"),
        path("progress/", views.QueueProgress.as_view(), name="queue-progress"),
    ]
)
