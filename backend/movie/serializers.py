"""all movie serializers"""

from artwork.serializers import ArtworkSerializer
from movie.models import Collection, Movie, MovieRelease
from rest_framework import serializers


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
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    name_display = serializers.CharField(read_only=True)
    collection = CollectionSerializer()

    class Meta:
        model = Movie
        fields = "__all__"


class MovieReleaseSerializer(serializers.ModelSerializer):
    """serialize release"""

    release_type_display = serializers.CharField(source="get_release_type_display", read_only=True)

    class Meta:
        model = MovieRelease
        fields = "__all__"
