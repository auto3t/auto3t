"""all api views"""

from rest_framework.views import APIView
from rest_framework.response import Response

from autot.models import TVShow
from autot.serializers import TVShowSerializer


class TVShowView(APIView):
    """tv show api view"""

    def get(self, request):
        """handle get request"""
        queryset = TVShow.objects.all()
        serializer = TVShowSerializer(queryset, many=True)

        return Response(serializer.data)
