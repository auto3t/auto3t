"""serialize backend models"""

from rest_framework import serializers
from autot.models import TVShow, TVSeason, TVEpisode


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

    class Meta:
        model = TVEpisode
        fields = "__all__"
