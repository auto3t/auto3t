"""serialize backend models"""

from rest_framework import serializers

from autot.models import SearchWord, SearchWordCategory, Torrent


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
