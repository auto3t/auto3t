"""all movie serializers"""

from artwork.serializers import ArtworkSerializer
from autot.models import TargetBitrate
from autot.serializers import SearchWordSerializer, TargetBitrateSerializer, TorrentSerializer
from autot.src.imdb_request import get_cached_imdb_rating
from autot.static import MovieProductionState, MovieReleaseType
from movie.models import Collection, Movie, MovieRelease
from rest_framework import serializers


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
            "the_moviedb_id",
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
    imdb_rating = serializers.SerializerMethodField(allow_null=True, read_only=True)

    class Meta:
        model = Movie
        fields = "__all__"

    def get_imdb_rating(self, obj: Movie) -> float | None:
        """get imdb rating, if available"""
        return get_cached_imdb_rating(imdb_id=obj.imdb_id)


class MovieMissingSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    """free serialize missing movie response"""

    the_moviedb_id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_null=True)
    tagline = serializers.CharField(allow_blank=True)
    release_date = serializers.DateField(required=False, allow_null=True)
    production_state = serializers.ChoiceField(choices=MovieProductionState.names())
    image_url = serializers.CharField(required=False, allow_null=True)
    imdb_id = serializers.CharField(allow_null=True)
    imdb_rating = serializers.FloatField(allow_null=True, required=False)


class MovieReleaseSerializer(serializers.ModelSerializer):
    """serialize release"""

    release_type_display = serializers.CharField(source="get_release_type_display", read_only=True)

    class Meta:
        model = MovieRelease
        fields = "__all__"


class MovieReleaseTargetSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    """serialize json object"""

    release_target = serializers.ChoiceField(choices=[i[0] for i in MovieReleaseType.choices()])
    release_label = serializers.ChoiceField([i[1] for i in MovieReleaseType.choices()])
    days_delay = serializers.IntegerField(min_value=0, allow_null=True)
    tracking = serializers.BooleanField()
