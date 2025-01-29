"""all auth views"""

from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView


class LoginView(APIView):
    """login"""

    permission_classes = [AllowAny]

    def post(self, request):
        """post request"""
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=HTTP_400_BAD_REQUEST)


class LogOutView(APIView):
    """logout session"""

    def post(self, request):
        """post request"""
        logout(request)
        return Response({"message": "Logout successful"}, status=HTTP_200_OK)
