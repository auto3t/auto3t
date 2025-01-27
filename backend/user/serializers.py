"""auth serializers"""

from rest_framework import serializers
from user.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """serialize user profile"""

    class Meta:
        model = UserProfile
        fields = "__all__"

    def update(self, instance, validated_data):
        """partial update"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
