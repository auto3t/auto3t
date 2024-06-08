"""all core models"""

from urllib.parse import parse_qs

from django.db import models


class SearchWordCategory(models.Model):
    """represent a category to group search words by"""

    name = models.CharField(max_length=255, unique=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)


class SearchWord(models.Model):
    """all available key words"""

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
