"""all tv serializers"""

from artwork.serializers import ArtworkSerializer
from autot.models import TargetBitrate
from autot.serializers import SearchWordSerializer, TargetBitrateSerializer, TorrentSerializer
from autot.src.imdb_request import get_cached_imdb_rating, get_cached_show_ratings
from autot.static import TvEpisodeStatus
from rest_framework import serializers
from tv.models import TVEpisode, TVSeason, TVShow


class TVShowSerializer(serializers.ModelSerializer):
    """serialize tv show"""

    all_keywords = SearchWordSerializer(source="get_keywords", many=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    image_show = ArtworkSerializer(read_only=True)
    episode_fallback = ArtworkSerializer(read_only=True)
    season_fallback = ArtworkSerializer(read_only=True)
    search_query = serializers.ReadOnlyField()
    credit_main_cast_count = serializers.IntegerField()
    credit_crew_count = serializers.IntegerField()
    runtime = serializers.IntegerField(read_only=True)
    target_bitrate = serializers.PrimaryKeyRelatedField(queryset=TargetBitrate.objects.all(), allow_null=True)
    target_file_size_str = serializers.CharField(read_only=True, allow_null=True)
    get_target_bitrate = TargetBitrateSerializer(read_only=True)
    imdb_rating = serializers.SerializerMethodField(allow_null=True, read_only=True)

    class Meta:
        model = TVShow
        exclude = ("credit",)

    def get_imdb_rating(self, obj: TVShow) -> float | None:
        """get imdb rating, if available"""
        return get_cached_imdb_rating(imdb_id=obj.imdb_id)


class TVSeasonSerializer(serializers.ModelSerializer):
    """serialize tv season"""

    show = TVShowSerializer()
    image_season = ArtworkSerializer(read_only=True)
    all_keywords = SearchWordSerializer(source="get_keywords", many=True)
    search_query = serializers.ReadOnlyField()
    runtime = serializers.IntegerField(read_only=True)
    target_bitrate = serializers.PrimaryKeyRelatedField(queryset=TargetBitrate.objects.all(), allow_null=True)
    target_file_size_str = serializers.CharField(read_only=True, allow_null=True)
    get_target_bitrate = TargetBitrateSerializer(read_only=True)

    class Meta:
        model = TVSeason
        fields = "__all__"


class TVEpisodeSerializer(serializers.ModelSerializer):
    """serialize tv episode"""

    season = TVSeasonSerializer()
    torrent = TorrentSerializer(many=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    image_episode = ArtworkSerializer(read_only=True)
    search_query = serializers.ReadOnlyField()
    media_server_url = serializers.CharField(read_only=True)
    target_bitrate = serializers.PrimaryKeyRelatedField(queryset=TargetBitrate.objects.all(), allow_null=True)
    target_file_size_str = serializers.CharField(read_only=True, allow_null=True)
    get_target_bitrate = TargetBitrateSerializer(read_only=True)
    imdb_rating = serializers.SerializerMethodField(allow_null=True, read_only=True)

    class Meta:
        model = TVEpisode
        fields = "__all__"

    def get_imdb_rating(self, obj: TVEpisode) -> float | None:
        """get imdb rating, if available"""
        show_imdb_id = obj.season.show.imdb_id
        if not show_imdb_id:
            return None

        ratings = get_cached_show_ratings(imdb_id=show_imdb_id)
        if not ratings:
            return None

        season_ratings = ratings.get(obj.season.number)
        if not season_ratings:
            return None

        episode = [i for i in season_ratings if i["episode_number"] == obj.number]
        if not episode:
            return None

        return episode[0]["average_rating"]


class TVEpisodeBulkUpdateSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    """update tv episodes in bulk"""

    status = serializers.ChoiceField(choices=TvEpisodeStatus.choices())

    def update(self, instance, validated_data):
        """update status field"""
        instance.status = validated_data.get("status", instance.status)
        instance.save()
        return instance
