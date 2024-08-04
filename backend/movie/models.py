"""all move models"""

from artwork.models import Artwork
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db import models


class Collection(models.Model):
    """describes a movie collection"""

    remote_server_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    image_collection = models.ForeignKey(
        Artwork, related_name="image_collection", on_delete=models.PROTECT, null=True, blank=True
    )

    def __str__(self):
        """collection string representation"""
        return str(self.name)

    def update_image_collection(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_collection:
            print(f"add image_collection artwork: {image_url}")
            image_collection, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_collection = image_collection
            self.save()
            return

        if not self.image_collection.image_url == image_url:
            print(f"update image_collection artwork: {image_url}")
            self.image_collection.update(image_url)


class Movie(models.Model):
    """describes a movie"""

    remote_server_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tagline = models.TextField(null=True, blank=True)
    image_movie = models.ForeignKey(
        Artwork, related_name="image_movie", on_delete=models.PROTECT, null=True, blank=True
    )
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        """movie string representation"""
        return f"{self.name} ({self.release_date})"  # pylint: disable=no-member

    def update_image_movie(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_movie:
            print(f"add image_movie artwork: {image_url}")
            image_movie, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_movie = image_movie
            self.save()
            return

        if not self.image_movie.image_url == image_url:
            print(f"update image_movie artwork: {image_url}")
            self.image_movie.update(image_url)


@receiver(post_delete, sender=Movie)
def delete_movie_image(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """signal for deleting movie image"""
    if instance.image_movie:
        instance.image_movie.delete()


@receiver(post_delete, sender=Collection)
def delete_collection_image(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """signal for deleting collection image"""
    if instance.image_collection:
        instance.image_collection.delete()
