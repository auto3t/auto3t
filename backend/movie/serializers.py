"""all movie serializers"""

from rest_framework import serializers

from artwork.serializers import ArtworkSerializer
from movie.models import Collection, Movie


class CollectionSerializer(serializers.ModelSerializer):
    """serialize movie collection"""

    image_collection = ArtworkSerializer(read_only=True)
    remote_server_url = serializers.CharField(read_only=True)

    class Meta:
        model = Collection
        fields = "__all__"


class MovieSerializer(serializers.ModelSerializer):
    """serialize movie"""

    image_movie = ArtworkSerializer(read_only=True)
    remote_server_url = serializers.CharField(read_only=True)
    collection = CollectionSerializer()

    class Meta:
        model = Movie
        fields = "__all__"
