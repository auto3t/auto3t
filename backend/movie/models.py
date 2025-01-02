"""all move models"""

from artwork.models import Artwork
from autot.models import log_change
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


class Collection(models.Model):
    """describes a movie collection"""

    TRACK_CHANGES = True
    remote_server_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    image_collection = models.ForeignKey(
        Artwork, related_name="image_collection", on_delete=models.PROTECT, null=True, blank=True
    )

    def __str__(self):
        """collection string representation"""
        return str(self.name)

    @property
    def remote_server_url(self) -> str:
        """concat url"""
        return f"https://www.themoviedb.org/collection/{self.remote_server_id}"

    def update_image_collection(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_collection:
            image_collection, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_collection = image_collection
            self.save()
            log_change(self, "u", "image_collection", new_value=image_url, comment="Added new image.")
            return

        if not self.image_collection.image_url == image_url:
            log_change(self, "u", "image_collection", new_value=image_url, comment="Updated image.")
            self.image_collection.update(image_url)


class Movie(models.Model):
    """describes a movie"""

    TRACK_CHANGES = True
    MOVIE_STATUS = [
        ("r", "Rumored"),
        ("p", "Planned"),
        ("i", "In Production"),
        ("p", "Post Production"),
        ("r", "Released"),
    ]

    remote_server_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tagline = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    image_movie = models.ForeignKey(
        Artwork, related_name="image_movie", on_delete=models.PROTECT, null=True, blank=True
    )
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT, null=True, blank=True)
    status = models.CharField(choices=MOVIE_STATUS, max_length=1, null=True, blank=True)

    def __str__(self):
        """movie string representation"""
        return self.name_display

    @property
    def remote_server_url(self) -> str:
        """concat url"""
        return f"https://www.themoviedb.org/movie/{self.remote_server_id}"

    @property
    def name_display(self) -> str:
        """display name"""
        return f"{self.name} ({self.release_date.year})"

    def update_image_movie(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_movie:
            image_movie, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_movie = image_movie
            self.save()
            log_change(self, "u", "image_movie", new_value=image_url, comment="Added new image")
            return

        if not self.image_movie.image_url == image_url:
            self.image_movie.update(image_url)
            log_change(self, "u", "image_movie", new_value=image_url, comment="Updated new image")


class MovieRelease(models.Model):
    """track release of movie"""

    TRACK_CHANGES = True
    RELEASE_TYPE = [
        (1, "Premiere"),
        (2, "Theatrical (limited)"),
        (3, "Theatrical"),
        (4, "Digital"),
        (5, "Physical"),
        (6, "TV"),
    ]

    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    country = models.CharField(max_length=2)
    release_type = models.PositiveIntegerField(choices=RELEASE_TYPE)
    release_date = models.DateTimeField()
    release_lang = models.CharField(max_length=2, blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("movie", "release_type")

    def __str__(self) -> str:
        release_str = f"{self.get_release_type_display()} {self.release_date.date().isoformat()}"
        return f"{self.movie.name_display} - {release_str}"


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
