"""serialize backend models"""

from autot.models import ActionLog, AutotScheduler, SearchWord, SearchWordCategory, Torrent
from rest_framework import serializers


class SearchWordCategorySerializer(serializers.ModelSerializer):
    """serialize search word category"""

    class Meta:
        model = SearchWordCategory
        fields = "__all__"


class SearchWordSerializer(serializers.ModelSerializer):
    """serialize search word"""

    category = serializers.PrimaryKeyRelatedField(queryset=SearchWordCategory.objects.all())
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


class SchedulerSeralizer(serializers.ModelSerializer):
    """serialize schedule"""

    job_display = serializers.CharField(source="get_job_display", read_only=True)
    job_id_registered = serializers.CharField(read_only=True)
    next_execution = serializers.CharField(read_only=True)

    class Meta:
        model = AutotScheduler
        fields = ["id", "job", "job_display", "job_id_registered", "cron_schedule", "next_execution"]


class ActionLogSerializer(serializers.ModelSerializer):
    """serialize action log item"""

    content_type_verbose = serializers.CharField(read_only=True)
    parsed = serializers.JSONField(read_only=True)

    class Meta:
        model = ActionLog
        fields = "__all__"
