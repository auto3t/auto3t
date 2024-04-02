"""serialize backend models"""

from rest_framework import serializers
from autot.models import TVShow, TVSeason, TVEpisode, Torrent


class TorrentSerializer(serializers.ModelSerializer):
    """serialize torrent"""

    class Meta:
        model = Torrent
        fields = "__all__"


class TVShowSerializer(serializers.ModelSerializer):
    """serialize tv show"""

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
