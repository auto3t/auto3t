"""serialize artwork"""

from artwork.models import Artwork
from rest_framework import serializers

class ArtworkSerializer(serializers.ModelSerializer):
    """serialize artwork model"""

    class Meta:
        model = Artwork
        fields = "__all__"
