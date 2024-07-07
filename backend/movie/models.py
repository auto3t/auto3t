"""all move models"""

from artwork.models import Artwork
from django.db import models


class Movie(models.Model):
    """describes a movie"""

    remote_server_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tagline = models.TextField(null=True, blank=True)
    image_movie = models.ForeignKey(
        Artwork, related_name="image_movie", on_delete=models.PROTECT, null=True, blank=True
    )

    def __str__(self):
        """movie string representation"""
        return f"{self.name} ({self.release_date.year})"
