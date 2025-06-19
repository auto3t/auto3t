"""all movie serializers"""

from artwork.serializers import ArtworkSerializer
from movie.models import Collection, Movie, MovieRelease
from rest_framework import serializers

from autot.models import TargetBitrate
from autot.serializers import SearchWordSerializer, TargetBitrateSerializer, TorrentSerializer
from autot.static import MovieProductionState


class CollectionSerializer(serializers.ModelSerializer):
    """serialize movie collection"""

    image_collection = ArtworkSerializer(read_only=True)
    remote_server_url = serializers.CharField(read_only=True)
    movie_ids = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Collection
        read_only_fields = (
            "id",
            "image_collection",
            "remote_server_url",
            "movie_ids",
            "remote_server_id",
            "name",
            "description",
        )
        fields = "__all__"


class MovieSerializer(serializers.ModelSerializer):
    """serialize movie"""

    all_keywords = SearchWordSerializer(source="get_keywords", many=True)
    target_bitrate = serializers.PrimaryKeyRelatedField(queryset=TargetBitrate.objects.all(), allow_null=True)
    target_file_size_str = serializers.CharField(read_only=True, allow_null=True)
    get_target_bitrate = TargetBitrateSerializer(read_only=True)
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
