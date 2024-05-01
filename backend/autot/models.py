"""all core models"""

import re
from hashlib import md5
from io import BytesIO
from typing import Self
from pathlib import Path
from urllib.parse import parse_qs
from PIL import Image

import pytz
import requests

from django.core.files.base import ContentFile
from django.dispatch import receiver
from django.db.models.signals import pre_save, post_delete
from django.db import models
from autot.src.helper import sanitize_file_name


class BaseModel(models.Model):
    """base model to enherit from"""

    IMAGE_SIZE: None | tuple[int, int] = None

    remote_server_id = models.CharField(max_length=255, unique=True)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    release_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to="images/", null=True, blank=True)

    class Meta:
        """set abstract to not create db relations"""
        abstract = True

    def download_image(self) -> bool:
        """download image to media root"""
        if not self.image_url:
            return False

        try:
            response = requests.get(self.image_url, timeout=30)
            if response.status_code == 200:
                folder = self.id_hash[-1].lower()
                image_io = BytesIO(response.content)
                image = self.crop_image(image_io)
                self.image.save(f"{folder}/{self.id_hash}.jpg", ContentFile(image), save=True)  # pylint: disable=no-member
                return True

            print(f"Failed to download image: {response.status_code}")
            return False

        except Exception as e:  # pylint: disable=broad-exception-caught
            print(f"An error occurred while downloading image: {str(e)}")
            return False

    def crop_image(self, image_io: BytesIO):
        """crop image to target resolution"""
        if not self.IMAGE_SIZE:
            return image_io.getvalue()

        img = Image.open(image_io)
        target_aspect = self.IMAGE_SIZE[0] / self.IMAGE_SIZE[1]
        current_aspect = img.width / img.height
        if target_aspect == current_aspect:
            return image_io.getvalue()

        if target_aspect > current_aspect:
            # crop on top and bottom
            to_crop = (img.height - (img.width / target_aspect)) / 2
            borders = (0, to_crop, img.width, img.height - to_crop)
        else:
            # crop left and right
            to_crop = (img.width - img.height * target_aspect) / 2
            borders = (to_crop, 0, img.width - to_crop, img.height)

        img = img.crop(borders)
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        buffer.seek(0)

        return buffer.getvalue()

    @property
    def id_hash(self) -> str:
        """hash of remote_server_id"""
        return md5(self.remote_server_id.encode()).hexdigest()  # pylint: disable=no-member


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
    is_default = models.BooleanField(default=False)
    category = models.ForeignKey(SearchWordCategory, on_delete=models.PROTECT)
    direction = models.CharField(max_length=1, default="i", choices=DIRECTIONS)

    class Meta:
        unique_together = ("direction", "category", "word")

    def save(self, *args, **kwargs):
        self.word = self.word.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.word


class Torrent(models.Model):
    """torrent representation"""

    TORRENT_TYPE = [
        ("e", "Episode"),
        ("s", "Season"),
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


class TVShow(BaseModel):
    """describes a show"""

    SHOW_STATUS = [
        ("r", "Running"),
        ("e", "Ended"),
        ("d", "In Development"),
        ("t", "To Be Determined"),
    ]
    IMAGE_SIZE = (2160, 2880)

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
    def get_keywords(self: Self):
        """Get search keywords for the TV show, apply overwrites"""
        # pylint: disable=E1101
        keywords = SearchWord.objects.none()
        for category in SearchWordCategory.objects.all():
            if self.search_keywords.filter(category=category).exists():
                keywords |= self.search_keywords.filter(category=category)
            else:
                keywords |= SearchWord.objects.filter(is_default=True, category=category)

        return keywords.distinct()

    def get_archive_path(self) -> Path:
        """sanitize name"""
        return Path(sanitize_file_name(self.name))

    def get_all_episodes(self):
        """get all episodes of show reverse lookup"""
        return TVEpisode.objects.filter(season__show=self)


class TVSeason(BaseModel):
    """describes a Season of a Show"""

    IMAGE_SIZE = (1000, 1500)

    number = models.IntegerField()
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    search_keywords = models.ManyToManyField(SearchWord)

    class Meta:
        unique_together = ("show", "number")

    def __str__(self):
        """set string representation"""
        return f"{self.show.name} S{str(self.number).zfill(2)}"

    def get_archive_path(self) -> str:
        """get archive path of season"""
        return self.show.get_archive_path() / f"Season {self.number}"

    @property
    def get_keywords(self):
        """get search keywords, fallback to default"""
        # pylint: disable=E1101
        if self.search_keywords.exists():
            return self.search_keywords.all()
        if self.show.search_keywords.exists():
            return self.show.search_keywords.all()

        return SearchWord.objects.filter(is_default=True)

    @property
    def search_query(self) -> str:
        """search for season"""
        show_name = self.show.search_name or self.show.name

        return f"{show_name} S{str(self.number).zfill(2)} COMPLETE"

    def is_valid_path(self, path) -> bool:
        """check for valid season path"""
        has_complete = "complete" in path.lower()

        return has_complete


class TVEpisode(BaseModel):
    """describes an Episode of a Season of a Show"""

    IMAGE_SIZE = (1920, 1080)
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
    def identifyer(self) -> str:
        """build S00E00 identifyer"""
        return f"S{str(self.season.number).zfill(2)}E{str(self.number).zfill(2)}"

    @property
    def identifyer_date(self) -> str:
        """date yyyy.mm.dd identifyer"""
        time_zone = pytz.timezone(self.season.show.show_time_zone)
        return self.release_date.astimezone(time_zone).strftime("%Y.%m.%d")  # pylint: disable=no-member

    @property
    def search_query(self) -> str:
        """build search query"""
        show_search = self.season.show.search_name or self.season.show.name
        if self.season.show.is_daily:
            seach_identifyer = self.identifyer_date
        else:
            seach_identifyer = self.identifyer

        return f"{show_search} {seach_identifyer}"

    @property
    def file_name(self) -> str:
        """build clean filename"""
        show_name = sanitize_file_name(self.season.show.name)
        title = sanitize_file_name(self.title)
        return f"{show_name} - {self.identifyer} - {title}"

    def get_archive_path(self, suffix: str | None = None) -> Path:
        """build archive path"""
        path = self.season.get_archive_path() / self.file_name
        if suffix:
            path = path.with_suffix(suffix)

        return path

    def is_valid_path(self, path: str) -> bool:
        """check if path is valid"""
        season_number = self.season.number
        episode_number = self.number

        if self.identifyer_date in path:
            return True

        pattern_s = re.compile(fr"s0?{season_number}e0?{episode_number}", re.IGNORECASE)
        if pattern_s.search(path):
            return True

        pattern_x = re.compile(fr"0?{season_number}x0?{episode_number}", re.IGNORECASE)
        if pattern_x.search(path):
            return True

        return False


@receiver(pre_save, sender=TVShow)
@receiver(pre_save, sender=TVSeason)
@receiver(pre_save, sender=TVEpisode)
def delete_existing_image(sender, instance, **kwargs):
    """replace image on update"""
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            return

        if old_instance.image:
            if old_instance.image != instance.image:
                old_instance.image.delete(save=False)


@receiver(post_delete, sender=TVShow)
@receiver(post_delete, sender=TVSeason)
@receiver(post_delete, sender=TVEpisode)
def delete_image_file(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete the image when object gets deleted"""
    print(instance)
    if instance.image:
        instance.image.delete(False)
