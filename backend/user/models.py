"""user models"""

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from autot.static import TvShowStatus


class UserProfile(models.Model):
    """user customizations"""

    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    shows_active_filter = models.BooleanField(null=True, blank=True)
    shows_status_filter = models.CharField(choices=TvShowStatus.choices(), max_length=1, null=True, blank=True)


@receiver(post_save, sender=get_user_model())
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=get_user_model())
def save_profile(sender, instance, **kwargs):
    instance.userprofile.save()
