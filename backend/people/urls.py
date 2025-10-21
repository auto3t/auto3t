"""all people api urls"""

from people import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"credit", views.CreditViewSet)
router.register(r"person", views.PersonViewSet)

urlpatterns = router.urls
