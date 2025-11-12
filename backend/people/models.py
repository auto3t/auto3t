"""people models"""

from datetime import datetime

from artwork.models import Artwork
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q
from django.utils import timezone

from autot.models import log_change


class Person(models.Model):
    """describes a unique person"""

    TRACK_CHANGES = True
    METADATA_SRC_CHOICES = [
        ("t", "tvmaze"),
        ("m", "moviedb"),
    ]

    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    image_person = models.ForeignKey(
        Artwork, related_name="image_person", on_delete=models.SET_NULL, null=True, blank=True
    )
    last_refresh = models.DateTimeField(null=True, blank=True)
    metadata_src = models.CharField(max_length=1, choices=METADATA_SRC_CHOICES)

    tvmaze_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    the_moviedb_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    imdb_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    tracking_movie = models.BooleanField(default=False)
    tracking_movie_started = models.DateTimeField(null=True, blank=True)
    tracking_tv = models.BooleanField(default=False)
    tracking_tv_started = models.DateTimeField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(tvmaze_id__isnull=False) | Q(the_moviedb_id__isnull=False),
                name="at_least_tvmaze_id_or_the_moviedb_id",
            ),
        ]

    def __str__(self):
        return str(self.name)

    def save(self, *args, **kwargs):
        """overwrite to handle timestamp and metadata src"""
        if self.pk:
            # update existing related timestamps
            prev = Person.objects.get(pk=self.pk)
            if prev.tracking_movie != self.tracking_movie:
                if self.tracking_movie is True:
                    self.tracking_movie_started = timezone.now()
                else:
                    self.tracking_movie_started = None
            if prev.tracking_tv != self.tracking_tv:
                if self.tracking_tv is True:
                    self.tracking_tv_started = timezone.now()
                else:
                    self.tracking_tv_started = None
        else:
            # new related timestamps
            if self.tracking_movie is True:
                self.tracking_movie_started = timezone.now()
            if self.tracking_tv is True:
                self.tracking_tv_started = timezone.now()

            # set default metadata_src
            if not self.metadata_src:
                self.metadata_src = "t" if self.tvmaze_id else "m"

        super().save(*args, **kwargs)

    @property
    def tvmaze_url(self) -> str | None:
        """tvmaze url"""
        if not self.tvmaze_id:
            return None

        return f"https://tvmaze.com/people/{self.tvmaze_id}"

    @property
    def the_moviedb_url(self) -> str | None:
        """the moviedb url"""
        if not self.the_moviedb_id:
            return None

        return f"https://www.themoviedb.org/person/{self.the_moviedb_id}"

    @property
    def imdb_url(self) -> str | None:
        """imdb url"""
        if not self.imdb_id:
            return None

        return f"https://www.imdb.com/name/{self.imdb_id}/"

    def is_to_delete(self) -> bool:
        """check if person can be deleted during auto cleanup"""
        if self.is_locked:
            return False

        return not self.credit_set.exists()

    def update_image_person(self, image_url: str | None) -> None:
        """handle update with or without existing, noop if identical"""
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

    def check_tracking_movies(self):
        """handle movie tracking, add if needed"""
        from movie.src.movie_search import MoviePersonSearch
        from movie.tasks import import_movie

        if not self.tracking_movie:
            return

        options = MoviePersonSearch().search(the_moviedb_person_id=self.the_moviedb_id)
        for movie_option in options:
            if movie_option["local_id"]:
                continue

            if not movie_option["release_date"]:
                continue

            release = datetime.fromisoformat(movie_option["release_date"]).astimezone()

            if release > self.tracking_movie_started:
                import_movie.delay(the_moviedb_id=movie_option["id"])

    def check_tracking_shows(self):
        """thandle show tracking, add if needed"""
        from tv.src.show_search import ShowPersonSearch
        from tv.tasks import import_show

        if not self.tracking_tv:
            return

        options = ShowPersonSearch().search(tvmaze_person_id=self.tvmaze_id)
        for show_option in options:
            if show_option["local_id"]:
                continue

            if not show_option["premiered"]:
                continue

            release = datetime.fromisoformat(show_option["premiered"]).astimezone()
            if release > self.tracking_tv_started:
                import_show.delay(tvmaze_id=show_option["id"])


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
