"""all movie serializers"""

from artwork.serializers import ArtworkSerializer
from movie.models import Collection, Movie, MovieRelease
from rest_framework import serializers

from autot.serializers import TorrentSerializer
from autot.static import MovieProductionState


class CollectionSerializer(serializers.ModelSerializer):
    """serialize movie collection"""

    image_collection = ArtworkSerializer(read_only=True)
    remote_server_url = serializers.CharField(read_only=True)
    movie_ids = serializers.ListField(child=serializers.CharField())

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
    torrent = TorrentSerializer(many=True)
    media_server_url = serializers.CharField(read_only=True)
    production_state_display = serializers.CharField(source="get_production_state_display", read_only=True)

    class Meta:
        model = Movie
        fields = "__all__"


class MovieMissingSerializer(serializers.Serializer):
    """free serialize missing movie response"""

    remote_server_id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_null=True)
    tagline = serializers.CharField(allow_blank=True)
    release_date = serializers.DateField(required=False, allow_null=True)
    production_state = serializers.ChoiceField(choices=MovieProductionState.names())
    image_url = serializers.CharField(required=False, allow_null=True)


class MovieReleaseSerializer(serializers.ModelSerializer):
    """serialize release"""

    release_type_display = serializers.CharField(source="get_release_type_display", read_only=True)

    class Meta:
        model = MovieRelease
        fields = "__all__"
