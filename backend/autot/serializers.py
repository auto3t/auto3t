"""serialize backend models"""

from autot.models import ActionLog, AppConfig, AutotScheduler, SearchWord, SearchWordCategory, TargetBitrate, Torrent
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
    related = serializers.JSONField(read_only=True)

    class Meta:
        model = SearchWord
        fields = "__all__"

    def get_category_name(self, obj):
        """category for get request"""
        return obj.category.name if obj.category else None


class TargetBitrateSerializer(serializers.ModelSerializer):
    """serialize target bitrate"""

    bitrate_str = serializers.CharField(read_only=True)
    related = serializers.JSONField(read_only=True)

    class Meta:
        model = TargetBitrate
        fields = "__all__"


class TorrentSerializer(serializers.ModelSerializer):
    """serialize torrent"""

    torrent_type_display = serializers.CharField(source="get_torrent_type_display", read_only=True)
    torrent_state_display = serializers.CharField(source="get_torrent_state_display", read_only=True)
    magnet_hash = serializers.CharField(read_only=True)

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


class AppConfigSerializer(serializers.ModelSerializer):
    """serialize appconfig"""

    movie_archive_format_display = serializers.CharField(source="get_movie_archive_format_display", read_only=True)
    movie_archive_format_options = serializers.JSONField(read_only=True)
    tv_archive_format_display = serializers.CharField(source="get_tv_archive_format_display", read_only=True)
    tv_archive_format_options = serializers.JSONField(read_only=True)
    file_archive_operation_display = serializers.CharField(source="get_file_archive_operation_display", read_only=True)
    file_archive_options = serializers.JSONField(read_only=True)

    class Meta:
        model = AppConfig
        exclude = ("id", "single_lock")


class ActionLogSerializer(serializers.ModelSerializer):
    """serialize action log item"""

    content_type_verbose = serializers.CharField(read_only=True)
    parsed = serializers.JSONField(read_only=True)

    class Meta:
        model = ActionLog
        fields = "__all__"
