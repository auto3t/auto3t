"""all core models"""

from pathlib import Path
from urllib.parse import parse_qs

import pytz

from django.db import models


class BaseModel(models.Model):
    """base model to enherit from"""

    remote_server_id = models.CharField(max_length=255, unique=True)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)

    class Meta:
        """set abstract to not create db relations"""
        abstract = True


class SearchWord(models.Model):
    """all available key words"""

    CATEGORY_OPTIONS = [
        ("r", "Resolution"),
        ("c", "Codec"),
        ("f", "Free"),
    ]
    DIRECTIONS = [
        ("i", "Include"),
        ("e", "Exclude"),
    ]

    word = models.CharField(max_length=255, null=True, blank=True, unique=True)
    is_default = models.BooleanField(default=False)
    category = models.CharField(max_length=1, default="f", choices=CATEGORY_OPTIONS)
    direction = models.CharField(max_length=1, default="i", choices=DIRECTIONS)

    def save(self, *args, **kwargs):
        self.word = self.word.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.word


class Torrent(models.Model):
    """torrent representation"""

    TORRENT_TYPE = [
        ("t", "tv"),
    ]
    TORRENT_STATE = [
        ("u", "undefined"),
        ("q", "queued"),
        ("d", "downloading"),
        ("f", "finished"),
        ("a", "archived"),
    ]

    magnet = models.TextField(unique=True)
    torrent_type = models.CharField(choices=TORRENT_TYPE, max_length=1)
    torrent_state = models.CharField(choices=TORRENT_STATE, max_length=1, default="u")

    @property
    def magnet_hash(self):
        """extract magnet hash"""
        return parse_qs(self.magnet).get('magnet:?xt')[0].split(":")[-1].lower()

    def __str__(self):
        """describe torrent"""
        return f"{self.magnet_hash} [{self.torrent_state}]"


class TVShow(BaseModel):
    """describes a show"""

    SHOW_STATUS = [
        ("r", "Running"),
        ("e", "Ended"),
        ("d", "In Development"),
        ("t", "To Be Determined"),
    ]

    name = models.CharField(max_length=255)
    search_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        choices=SHOW_STATUS, max_length=1, null=True, blank=True
    )
    is_daily = models.BooleanField(default=False)
    show_time_zone = models.CharField(max_length=255, default="UTC")
    search_keywords = models.ManyToManyField(SearchWord)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        """set string representation"""
        return f"{self.name}"

    @property
    def get_keywords(self):
        """get search keywords, fallback to default"""
        # pylint: disable=E1101
        if self.search_keywords.exists():
            return self.search_keywords.all()

        return SearchWord.objects.filter(is_default=True)

    def get_all_episodes(self):
        """get all episodes of show reverse lookup"""
        return TVEpisode.objects.filter(season__show=self)


class TVSeason(BaseModel):
    """describes a Season of a Show"""

    number = models.IntegerField()
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    search_keywords = models.ManyToManyField(SearchWord)

    class Meta:
        unique_together = ("show", "number")

    def __str__(self):
        """set string representation"""
        return f"{self.show.name} S{str(self.number).zfill(2)}"

    @property
    def get_keywords(self):
        """get search keywords, fallback to default"""
        # pylint: disable=E1101
        if self.search_keywords.exists():
            return self.search_keywords.all()
        if self.show.search_keywords.exists:
            return self.show.search_keywords.all()

        return SearchWord.objects.filter(is_default=True)


class TVEpisode(BaseModel):
    """describes an Episode of a Season of a Show"""

    EPISODE_STATUS = [
        ("u", "Upcoming"),
        ("s", "Searching"),
        ("d", "Downloading"),
        ("f", "Finished"),
        ("i", "Ignored"),
    ]

    number = models.IntegerField()
    title = models.CharField(max_length=255)
    season = models.ForeignKey(TVSeason, on_delete=models.CASCADE)
    media_server_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(choices=EPISODE_STATUS, max_length=1, null=True, blank=True)
    torrent = models.ForeignKey(Torrent, null=True, blank=True, on_delete=models.CASCADE)
    search_keywords = models.ManyToManyField(SearchWord)

    class Meta:
        unique_together = ("season", "number")

    def __str__(self):
        """set string representation"""
        return self.file_name

    @property
    def get_keywords(self):
        """get search keywords, fallback to default"""
        # pylint: disable=E1101
        if self.search_keywords.exists():
            return self.search_keywords.all()
        if self.season.search_keywords.exists():
            return self.season.search_keywords.all()
        if self.season.show.search_keywords.exists():
            return self.season.show.search_keywords.all()

        return SearchWord.objects.filter(is_default=True)

    @property
    def archive_folder(self) -> Path:
        """build archive folder"""
        return Path(self.season.show.name, f"Season {self.season.number}")

    @property
    def identifyer(self) -> str:
        """build S00E00 identifyer"""
        return f"S{str(self.season.number).zfill(2)}E{str(self.number).zfill(2)}"

    @property
    def search_query(self) -> str:
        """build search query"""
        show_search = self.season.show.search_name or self.season.show.name
        if self.season.show.is_daily:
            time_zone = pytz.timezone(self.season.show.show_time_zone)
            seach_identifyer = self.release_date.astimezone(time_zone).strftime("%Y.%m.%d")  # pylint: disable=no-member
        else:
            seach_identifyer = self.identifyer

        return f"{show_search} {seach_identifyer}"

    @property
    def file_name(self) -> str:
        """build filename"""
        return f"{self.season.show.name} - {self.identifyer} - {self.title}"

    def get_archive_path(self, suffix: str | None = None) -> Path:
        """build archive path"""
        path = self.archive_folder / self.file_name
        if suffix:
            path = path.with_suffix(suffix)

        return path
