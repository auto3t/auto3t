"""all core models"""

from datetime import datetime, timezone
from urllib.parse import parse_qs

from crontab import CronTab
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver
from django_rq import get_scheduler
from django_rq.jobs import Job


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

    TRACK_CHANGES = True
    TORRENT_TYPE = [
        ("e", "Episode"),
        ("s", "Season"),
    ]
    TORRENT_STATE = [
        ("u", "Undefined"),
        ("q", "Queued"),
        ("d", "Downloading"),
        ("f", "Finished"),
        ("a", "Archived"),
        ("i", "ignored"),
    ]

    magnet = models.TextField(unique=True)
    torrent_type = models.CharField(choices=TORRENT_TYPE, max_length=1)
    torrent_state = models.CharField(choices=TORRENT_STATE, max_length=1, default="u")
    progress = models.IntegerField(null=True, blank=True)

    @property
    def magnet_hash(self):
        """extract magnet hash"""
        return parse_qs(self.magnet).get('magnet:?xt')[0].split(":")[-1].lower()

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
    JOB_CHOICES = [
        ("tv.tasks.refresh_all_shows", "Refresh All Shows"),
        ("tv.tasks.refresh_status", "Refresh Status"),
    ]

    job = models.CharField(max_length=255, choices=JOB_CHOICES, unique=True)
    cron_schedule = models.CharField(max_length=255, validators=[validate_cron])
    job_id_registered = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self) -> str:
        """describe schedule"""
        return f"{self.job} [{self.cron_schedule}]"

    @property
    def next_execution(self) -> str | None:
        """get next execution time"""
        scheduler = get_scheduler("default")
        job = self.get_on_scheduler(scheduler)
        if not job:
            return None

        next_execution_time = job[1].astimezone(timezone.utc).isoformat()

        return next_execution_time

    def get_on_scheduler(self, scheduler) -> tuple[Job, datetime] | None:
        """get job on scheduler"""
        if not self.job_id_registered:
            return None

        for job in scheduler.get_jobs(with_times=True):
            if job[0].id == self.job_id_registered:
                return job

        return None

    def create_on_scheduler(self, scheduler):
        """create on schedule"""
        if self.job_id_registered:
            self.delete_on_scheduler(scheduler)
            self.job_id_registered = None

        job = scheduler.cron(cron_string=self.cron_schedule, func=self.job)
        self.job_id_registered = job.id

    def delete_on_scheduler(self, scheduler) -> None:
        """remove from scheduler"""
        job = self.get_on_scheduler(scheduler)
        if job:
            job[0].delete()


@receiver(post_delete, sender=AutotScheduler)
def delete_schedule(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete from filesystem"""
    print(f"delete signal: {instance}")
    scheduler = get_scheduler("default")
    instance.delete_on_scheduler(scheduler)


@receiver(pre_save, sender=AutotScheduler)
def create_update_schedule(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """create schedule"""
    print(f"post_save signal: {instance}")
    scheduler = get_scheduler("default")
    instance.create_on_scheduler(scheduler)


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
    def content_type_verbose(self):
        """Returns a human-readable name for the content type."""
        return self.content_type.model_class()._meta.verbose_name.title()

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
    ActionLog.objects.create(
        content_type=content_type,
        object_id=instance.pk,
        action=action,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        comment=comment,
    )


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

    log_change(instance, action="d")
