"""all tv serializers"""

from artwork.serializers import ArtworkSerializer
from autot.serializers import SearchWordSerializer, TorrentSerializer
from rest_framework import serializers
from tv.models import TVEpisode, TVSeason, TVShow


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
    all_keywords = SearchWordSerializer(source="get_keywords", many=True)
    search_query = serializers.ReadOnlyField()

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
