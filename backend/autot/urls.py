"""all api urls"""

from rest_framework.routers import DefaultRouter
from autot import views


router = DefaultRouter()
router.register(r"torrent", views.TorrentViewSet, basename="torrent")
router.register(r"keyword-category", views.SearchWordCategoryView, basename="keyword-category")
router.register(r"keyword", views.SearchWordView, basename="keyword")
urlpatterns = router.urls
