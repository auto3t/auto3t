"""people models"""

from artwork.models import Artwork
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from autot.models import log_change


class Person(models.Model):
    """describes a unique person"""

    TRACK_CHANGES = True

    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    image_person = models.ForeignKey(
        Artwork, related_name="image_person", on_delete=models.SET_NULL, null=True, blank=True
    )

    tvmaze_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    the_moviedb_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    imdb_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return str(self.name)

    def update_image_person(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_person:
            image_person, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_person = image_person
            self.save()
            log_change(self, "u", "image_person", new_value=image_url, comment="Added new image")
            return

        if not self.image_person.image_url == image_url:
            self.image_person.update(image_url)
            log_change(self, "u", "image_person", new_value=image_url, comment="Updated new image")


class Credit(models.Model):
    """describes role of a person on an other model"""

    TRACK_CHANGES = True
    ROLE_CHOICES = [
        ("main_cast", "Main Cast"),
        ("season_cast", "Season Cast"),
        ("guest", "Guest Star"),
        ("actor", "Actor"),
        ("crew", "Crew"),
    ]

    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    role_name = models.CharField(max_length=255, null=True, blank=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    class Meta:
        unique_together = ("person", "role", "role_name", "content_type", "object_id")

    def __str__(self):
        """str based on role_name if available"""
        if self.role_name:
            return f"{self.person.name} as {self.role_name} ({self.role}) in {self.content_object}"

        return f"{self.person.name} ({self.role}) in {self.content_object}"
