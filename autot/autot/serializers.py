"""serialize backend models"""

from rest_framework import serializers
from autot.models import TVShow


class TVShowSerializer(serializers.ModelSerializer):
    """serialize tv show"""

    class Meta:
        model = TVShow
        fields = "__all__"
