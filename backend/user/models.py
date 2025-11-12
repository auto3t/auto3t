"""user models"""

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from autot.static import MovieProductionState, MovieStatus, TvShowStatus


class UserProfile(models.Model):
    """user customizations"""

    CREDIT_FILTER_CHOICES = [
        ("m", "movie"),
        ("t", "tv"),
    ]

    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    shows_active_filter = models.BooleanField(null=True, blank=True)
    shows_status_filter = models.CharField(choices=TvShowStatus.choices(), max_length=1, null=True, blank=True)
    movies_production_filter = models.CharField(
        choices=MovieProductionState.choices(), max_length=1, null=True, blank=True
    )
    movies_active_filter = models.BooleanField(null=True, blank=True)
    movie_status_filter = models.CharField(choices=MovieStatus.choices(), max_length=1, null=True, blank=True)
    collection_tracking_filter = models.BooleanField(null=True, blank=True)
    people_movie_tracking_filter = models.BooleanField(null=True, blank=True)
    people_tv_tracking_filter = models.BooleanField(null=True, blank=True)
    people_locked_filter = models.BooleanField(null=True, blank=True)
    people_credit_filter = models.CharField(choices=CREDIT_FILTER_CHOICES, max_length=1, null=True, blank=True)


@receiver(post_save, sender=get_user_model())
def create_profile(sender, instance, created, **kwargs):  # pylint: disable=unused-argument
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=get_user_model())
def save_profile(sender, instance, **kwargs):  # pylint: disable=unused-argument
    instance.userprofile.save()
