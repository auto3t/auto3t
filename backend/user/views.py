"""user views"""

from django.shortcuts import get_object_or_404
from rest_framework import views
from rest_framework.response import Response
from user.models import UserProfile
from user.serializers import UserProfileSerializer


class UserProfileView(views.APIView):
    """get and modify profile"""

    def get(self, request):
        """get user profile"""
        profile = self._get_profile(request)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def post(self, request):
        """update profile"""
        profile = self._get_profile(request)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

        return Response(serializer.errors, status=400)

    def _get_profile(self, request):
        """get the profile"""
        return get_object_or_404(UserProfile, pk=request.user.userprofile.pk)
