"""serialize backend models"""

from rest_framework import serializers
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

    class Meta:
        model = SearchWord
        fields = "__all__"

    def get_category_name(self, obj):
        """category for get request"""
        return obj.category.name if obj.category else None


class TorrentSerializer(serializers.ModelSerializer):
    """serialize torrent"""

    class Meta:
        model = Torrent
        fields = "__all__"


class TVShowSerializer(serializers.ModelSerializer):
    """serialize tv show"""

    all_keywords = SearchWordSerializer(source="get_keywords", many=True)

    class Meta:
        model = TVShow
        fields = "__all__"


class TVSeasonSerializer(serializers.ModelSerializer):
    """serialize tv season"""

    show = TVShowSerializer()

    class Meta:
        model = TVSeason
        fields = "__all__"


class TVEpisodeSerializer(serializers.ModelSerializer):
    """serialize tv episode"""

    season = TVSeasonSerializer()
    torrent = TorrentSerializer()

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
