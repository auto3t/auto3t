"""serialize artwork"""

from rest_framework import serializers

from artwork.models import Artwork


class ArtworkSerializer(serializers.ModelSerializer):
    """serialize artwork model"""

    image = serializers.ImageField(use_url=False)

    class Meta:
        model = Artwork
        fields = "__all__"
