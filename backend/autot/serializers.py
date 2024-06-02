"""serialize backend models"""

from rest_framework import serializers
from artwork.serializers import ArtworkSerializer
from autot.models import (
    SearchWord,
    SearchWordCategory,
    TVShow,
    TVSeason,
    TVEpisode,
    Torrent,
)


class SearchWordCategorySerializer(serializers.ModelSerializer):
    """serialize search word category"""

    class Meta:
        model = SearchWordCategory
        fields = "__all__"


class SearchWordSerializer(serializers.ModelSerializer):
    """serialize search word """

    category = serializers.PrimaryKeyRelatedField(
        queryset=SearchWordCategory.objects.all()
    )
    category_name = serializers.SerializerMethodField(read_only=True)
    direction_display = serializers.CharField(source="get_direction_display", read_only=True)

    class Meta:
        model = SearchWord
        fields = "__all__"

    def get_category_name(self, obj):
        """category for get request"""
        return obj.category.name if obj.category else None


class TorrentSerializer(serializers.ModelSerializer):
    """serialize torrent"""

    torrent_type_display = serializers.CharField(source="get_torrent_type_display", read_only=True)
    torrent_state_display = serializers.CharField(source="get_torrent_state_display", read_only=True)

    class Meta:
        model = Torrent
        fields = "__all__"


class TVShowSerializer(serializers.ModelSerializer):
    """serialize tv show"""

    all_keywords = SearchWordSerializer(source="get_keywords", many=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    image_show = ArtworkSerializer(read_only=True)
    episode_fallback = ArtworkSerializer(read_only=True)
    season_fallback = ArtworkSerializer(read_only=True)

    class Meta:
        model = TVShow
        fields = "__all__"


class TVSeasonSerializer(serializers.ModelSerializer):
    """serialize tv season"""

    show = TVShowSerializer()
    image_season = ArtworkSerializer(read_only=True)

    class Meta:
        model = TVSeason
        fields = "__all__"


class TVEpisodeSerializer(serializers.ModelSerializer):
    """serialize tv episode"""

    season = TVSeasonSerializer()
    torrent = TorrentSerializer()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    image_episode = ArtworkSerializer(read_only=True)
    search_query = serializers.ReadOnlyField()

    class Meta:
        model = TVEpisode
        fields = "__all__"


class TVEpisodeBulkUpdateSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    """update tv episodes in bulk"""

    status = serializers.ChoiceField(choices=TVEpisode.EPISODE_STATUS)

    def update(self, instance, validated_data):
        """update status field"""
        instance.status = validated_data.get("status", instance.status)
        instance.save()
        return instance
