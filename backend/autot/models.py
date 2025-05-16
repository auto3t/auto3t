"""all core models"""

import logging
import zoneinfo
from datetime import datetime

from crontab import CronTab
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_delete, post_save, pre_delete
from django.dispatch import receiver
from django.urls import reverse
from django_rq import get_scheduler
from django_rq.jobs import Job

from autot.src.helper import get_magnet_hash
from autot.static import TASK_OPTIONS

logger = logging.getLogger("django")


class SearchWordCategory(models.Model):
    """represent a category to group search words by"""

    TRACK_CHANGES = True

    name = models.CharField(max_length=255, unique=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)


class SearchWord(models.Model):
    """all available key words"""

    TRACK_CHANGES = True
    DIRECTIONS = [
        ("i", "Include"),
        ("e", "Exclude"),
    ]

    word = models.CharField(max_length=255)
    category = models.ForeignKey(SearchWordCategory, on_delete=models.PROTECT)
    direction = models.CharField(max_length=1, default="i", choices=DIRECTIONS)
    movie_default = models.BooleanField(default=False)
    tv_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ("direction", "category", "word")

    def save(self, *args, **kwargs):
        self.word = self.word.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name}: {self.word} [{self.direction}]"


class Torrent(models.Model):
    """torrent representation"""

    TORRENT_TYPE = [
        ("e", "Episode"),
        ("s", "Season"),
        ("m", "Movie"),
    ]
    TORRENT_STATE = [
        ("u", "Undefined"),
        ("q", "Queued"),
        ("d", "Downloading"),
        ("f", "Finished"),
        ("a", "Archived"),
        ("i", "Ignored"),
    ]

    magnet = models.TextField()
    torrent_type = models.CharField(choices=TORRENT_TYPE, max_length=1)
    torrent_state = models.CharField(choices=TORRENT_STATE, max_length=1, default="u")
    progress = models.IntegerField(null=True, blank=True)
    has_expected_files = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ("magnet", "torrent_type")

    @property
    def magnet_hash(self):
        """extract magnet hash"""
        return get_magnet_hash(self.magnet)

    def __str__(self):
        """describe torrent"""
        torrent_string = f"{self.magnet_hash} [{self.torrent_state}]"
        if self.progress:
            torrent_string = f"{torrent_string}[{self.progress}%]"

        return torrent_string


def validate_cron(cron_schedule):
    """check cron_schedule is valid"""
    try:
        CronTab(cron_schedule)
    except ValueError as err:
        raise ValidationError(err) from err


class AutotScheduler(models.Model):
    """base class for schedules"""

    TRACK_CHANGES = True
    JOB_CHOICES = [(i["job"], i["name"]) for i in TASK_OPTIONS]

    job = models.CharField(max_length=255, choices=JOB_CHOICES, unique=True)
    cron_schedule = models.CharField(max_length=255, validators=[validate_cron])

    def __str__(self) -> str:
        """describe schedule"""
        return f"{self.job} [{self.cron_schedule}]"

    @property
    def schedule_name(self) -> str:
        """schedule name to run job on"""
        for task in TASK_OPTIONS:
            if task["job"] == self.job:
                return task["queue"]

        raise ValueError(f"failed to find queue in TASK_OPTIONS for {self.job}")

    @property
    def next_execution(self) -> str | None:
        """get next execution time"""
        job = self.get_on_scheduler()
        if not job:
            return None

        next_utc = job[1].replace(tzinfo=zoneinfo.ZoneInfo("UTC"))
        next_tz = next_utc.astimezone(zoneinfo.ZoneInfo(settings.TIME_ZONE))

        return next_tz.isoformat()

    def get_on_scheduler(self) -> tuple[Job, datetime] | None:
        """get job on scheduler"""
        scheduler = get_scheduler(self.schedule_name)
        for job in scheduler.get_jobs(with_times=True):
            if job[0].func_name == self.job:
                return job

        return None

    def create_on_scheduler(self):
        """create on schedule"""
        scheduled = self.get_on_scheduler()
        if scheduled:
            scheduled[0].delete()

        scheduler = get_scheduler(self.schedule_name)
        job = scheduler.cron(cron_string=self.cron_schedule, func=self.job)
        logger.info(f"registered new schedule for job {job.func_name}")

    def delete_on_scheduler(self) -> None:
        """remove from scheduler"""
        job = self.get_on_scheduler()
        if job:
            job[0].delete()


@receiver(post_delete, sender=AutotScheduler)
def delete_schedule(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete from filesystem"""
    logger.info("scheduler delete signal: %s", instance)
    instance.delete_on_scheduler()


@receiver(post_save, sender=AutotScheduler)
def create_update_schedule(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """create schedule"""
    logger.info("scheduler post save signal: %s", instance)
    instance.create_on_scheduler()


class ActionLog(models.Model):
    """track actions"""

    ACTION_OPTIONS = [
        ("c", "created"),
        ("u", "updated"),
        ("d", "deleted"),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=1, choices=ACTION_OPTIONS)
    field_name = models.CharField(max_length=255, blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    comment = models.TextField(blank=True, null=True)

    @property
    def parsed(self) -> dict:
        """parse action log item for frontend"""
        return {
            "action": self.get_action_display().title(),
            "content_type": self.content_type.model_class()._meta.verbose_name.title(),
            "content_item_name": str(self.content_object) if self.content_object else "",
            "url": self._get_reverse_url(),
            "message": self._build_message(),
        }

    def _get_reverse_url(self) -> str | None:
        """get reverse url"""
        if self.action == "d":
            return None

        content_class = self.content_type.model_class().__name__
        reverse_api_url = None
        if content_class == "TVEpisode":
            reverse_api_url = reverse("episode-detail", kwargs={"pk": self.object_id})

        elif content_class == "TVSeason":
            reverse_api_url = reverse("season-detail", kwargs={"pk": self.object_id})

        elif content_class == "TVShow":
            reverse_api_url = reverse("show-detail", kwargs={"pk": self.object_id})

        elif content_class == "Movie":
            reverse_api_url = reverse("movie-detail", kwargs={"pk": self.object_id})

        if reverse_api_url:
            return reverse_api_url.lstrip("/api")

        return None

    def _build_message(self):
        """parse field"""
        message = None

        if self.field_name:
            message = self._build_field_message()
        elif self.action == "c":
            message = self._build_create_message()

        return message

    def _build_create_message(self):
        """build create message"""
        content_type = self.content_type.model_class()._meta.verbose_name.title()
        return f"Added new {content_type}."

    def _build_field_message(self):
        """build message for field changes"""

        for field in self.content_type.model_class()._meta.fields:
            if field.name != self.field_name:
                continue

            old_str = self.old_value
            new_str = self.new_value

            if field.choices:
                for choice in field.choices:
                    if choice[0] == self.old_value:
                        old_str = choice[1]

                    if choice[0] == self.new_value:
                        new_str = choice[1]

            if not old_str:
                message = f"Added {field.verbose_name.title()} {new_str}"
            else:
                message = f"Changed {field.verbose_name.title()} from {old_str} to {new_str}"

            return message

        return None

    def __str__(self) -> str:
        """action log string"""
        base_str = f"{self.content_object} [{self.action}]"
        if self.field_name:
            base_str += f" {self.field_name}: {self.old_value} -> {self.new_value}"
        if self.comment:
            base_str += f" - {self.comment}"
        return base_str


def log_change(
    instance,
    action: str,
    field_name: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
    comment: str | None = None,
) -> None:
    """Logs a change to the ActionLog model."""
    content_type = ContentType.objects.get_for_model(instance.__class__)
    log_item = ActionLog.objects.create(
        content_type=content_type,
        object_id=instance.pk,
        action=action,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        comment=comment,
    )
    logger.info(log_item)


def get_logs(instance):
    """get logs of instance"""
    content_type = ContentType.objects.get_for_model(instance.__class__)
    return ActionLog.objects.filter(content_type=content_type, object_id=instance.pk).order_by("-timestamp")


@receiver(post_save)
def track_create_update(sender, instance, created, **kwargs):
    """record create events"""
    if not getattr(sender, "TRACK_CHANGES", None):
        return

    if created:
        log_change(instance, action="c")


@receiver(pre_delete)
def track_delete(sender, instance, **kwargs):
    """track delete events"""
    if not getattr(sender, "TRACK_CHANGES", None):
        return

    log_change(instance, action="d", comment=f"Deleting: {instance}")
