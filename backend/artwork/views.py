"""artwork view"""

from django.conf import settings
from django.http import Http404, FileResponse
from rest_framework.views import APIView


class ImageView(APIView):
    """handle artwork"""

    def get(self, request, folder, filename):
        """get image from filesystem"""
        path = settings.MEDIA_ROOT / "images" / folder / filename
        if not path.exists():
            raise Http404("Image not found")

        return FileResponse(open(path, "rb"), content_type="image/jpeg")
