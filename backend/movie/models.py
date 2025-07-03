"""all move models"""

from pathlib import Path
from typing import Self

from artwork.models import Artwork
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from rapidfuzz import fuzz

from autot.models import SearchWord, SearchWordCategory, TargetBitrate, Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.helper import title_clean
from autot.static import MovieProductionState, MovieReleaseType, MovieStatus


class BaseModel(models.Model):
    """base model to enherit from"""

    class Meta:
        """set abstract to not create db relations"""

        abstract = True

    def add_keyword(self, instance, to_add) -> None:
        """add keyword or overwrite"""
        existing = instance.search_keywords.all()
        extend_by = SearchWord.objects.filter(id=to_add.id)
        words = existing.exclude(category_id=to_add.category_id).union(extend_by)
        instance.search_keywords.set(words)
        instance.save()

    def remove_keyword(self, instance, to_remove) -> None:
        """remove keyword if existing"""
        instance.search_keywords.remove(to_remove)


class Collection(BaseModel):
    """describes a movie collection"""

    TRACK_CHANGES = True
    the_moviedb_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    image_collection = models.ForeignKey(
        Artwork, related_name="image_collection", on_delete=models.PROTECT, null=True, blank=True
    )
    the_moviedb_ids = models.JSONField(default=list)
    tracking = models.BooleanField(default=False)

    def __str__(self):
        """collection string representation"""
        return str(self.name)

    @property
    def remote_server_url(self) -> str:
        """concat url"""
        return f"https://www.themoviedb.org/collection/{self.the_moviedb_id}"

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


class Movie(BaseModel):
    """describes a movie"""

    TRACK_CHANGES = True
    CONFIG: ConfigType = get_config()
    FUZZY_RATIO = 95

    the_moviedb_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tagline = models.TextField(null=True, blank=True)
    runtime = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    image_movie = models.ForeignKey(
        Artwork, related_name="image_movie", on_delete=models.PROTECT, null=True, blank=True
    )
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, null=True, blank=True)
    production_state = models.CharField(choices=MovieProductionState.choices(), max_length=1, null=True, blank=True)
    status = models.CharField(choices=MovieStatus.choices(), max_length=1, null=True, blank=True)
    torrent = models.ManyToManyField(Torrent, related_name="torrent")
    search_keywords = models.ManyToManyField(SearchWord)
    target_bitrate = models.ForeignKey(TargetBitrate, null=True, blank=True, on_delete=models.SET_NULL)

    media_server_id = models.CharField(max_length=255, null=True, blank=True)
    media_server_meta = models.JSONField(null=True, blank=True)

    def __str__(self):
        """movie string representation"""
        return self.name_display

    @property
    def remote_server_url(self) -> str:
        """concat url"""
        return f"https://www.themoviedb.org/movie/{self.the_moviedb_id}"

    @property
    def name_display(self) -> str:
        """display name"""
        display = self.name
        if self.release_date:
            display += f" ({self.release_date.year})"

        return display

    @property
    def media_server_url(self) -> str | None:
        """url in media server"""
        if not self.media_server_id:
            return None

        base_url = self.CONFIG["JF_PROXY_URL"]
        return f"{base_url}/web/#/details?id={self.media_server_id}"

    @property
    def search_query(self) -> str:
        """build search query"""
        search_query = self.name
        if self.release_date:
            search_query += f" {self.release_date.year}"
        return search_query

    @property
    def target_file_size(self) -> tuple[float | None, float | None]:
        """target filesize based on runtime and target bitrate"""
        target_bitrate = self.get_target_bitrate()
        if not target_bitrate:
            return None, None

        if not self.runtime:
            return None, None

        lower = self.runtime * 60 * (target_bitrate.bitrate * 100 - target_bitrate.plusminus)
        upper = self.runtime * 60 * (target_bitrate.bitrate * 100 + target_bitrate.plusminus)

        return lower, upper

    @property
    def target_file_size_str(self) -> None | str:
        """target filesize in str for UI"""
        lower, upper = self.target_file_size
        if not lower or not upper:
            return None

        return f"{round(lower / 1000000, 2)} - {round(upper / 1000000, 2)}GB"

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

    def add_magnet(self, magnet: str, title: str | None) -> None:
        """add magnet to movie"""
        from autot.src.download import Transmission

        to_cancel = self.torrent.exclude(torrent_state="i")
        for torrent in to_cancel:
            Transmission().cancel(torrent)

        torrent, _ = Torrent.objects.get_or_create(magnet=magnet, torrent_type="m")
        if title:
            torrent.title = title
            torrent.save()

        self.torrent.add(torrent)
        self.status = "d"
        self.media_server_id = None
        self.media_server_meta = None
        self.save()
        log_change(self, action="c", field_name="torrent", new_value=torrent.magnet_hash)

    def reset_download(self) -> None:
        """reset torrent and state"""
        self.torrent.filter(torrent_state__in=["u", "q", "d"]).update(torrent_state="i", progress=None)
        self.status = None
        self.media_server_id = None
        self.save()
        log_change(self, "u", comment="Cancel Torrent Download")

    def get_archive_path(self, suffix: str | None = None) -> Path:
        """build archive path"""
        path = Path(str(self.release_date.year)) / self.name_display / self.name_display
        if suffix:
            path = Path(f"{path}{suffix}")

        return path

    def is_valid_path(self, path: str, strict: bool = True) -> bool:
        """check if path is valid"""
        movie_search = title_clean(self.name)
        year_str = str(self.release_date.year)
        path_lower = path.lower()
        close_enough = fuzz.partial_ratio(movie_search, path_lower) > self.FUZZY_RATIO
        if close_enough and year_str in path_lower:
            return True

        return False

    def get_keywords(self: Self):
        """build keywords for movie"""
        keywords = SearchWord.objects.none()
        for category in SearchWordCategory.objects.all():
            if self.search_keywords.filter(category=category).exists():
                keywords |= self.search_keywords.filter(category=category)
            else:
                keywords |= SearchWord.objects.filter(category=category, movie_default=True)

        return keywords.distinct()

    def get_target_bitrate(self: Self) -> TargetBitrate | None:
        """target bitrate"""
        if self.target_bitrate:
            return self.target_bitrate

        try:
            return TargetBitrate.objects.get(movie_default=True)
        except TargetBitrate.DoesNotExist:
            pass

        return None


class MovieRelease(models.Model):
    """track release of movie"""

    TRACK_CHANGES = True

    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    country = models.CharField(max_length=2)
    release_type = models.PositiveIntegerField(choices=MovieReleaseType.choices())
    release_date = models.DateTimeField()
    release_lang = models.CharField(max_length=2, blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("movie", "release_type")

    def __str__(self) -> str:
        release_str = f"{self.get_release_type_display()} {self.release_date.date().isoformat()}"
        return f"{self.movie.name_display} - {release_str}"


class MovieReleaseTarget(models.Model):
    """movie release target config"""

    DEFAULT = [
        {
            "tracking": False,
            "release_target": i[0],
            "release_label": i[1],
            "days_delay": None,
        }
        for i in MovieReleaseType.choices()
    ]

    target = models.JSONField(blank=True, null=True)

    def __str__(self):
        return str(self.target)


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
