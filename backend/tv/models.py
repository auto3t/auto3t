"""all tv models"""

import base64
import re
from io import BytesIO
from pathlib import Path
from typing import TYPE_CHECKING, Self

import pytz
from artwork.models import Artwork
from autot.models import ActionLog, SearchWord, SearchWordCategory, Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.helper import sanitize_file_name
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q
from django.db.models.query import QuerySet
from django.db.models.signals import post_delete
from django.dispatch import receiver
from PIL import Image, ImageFilter

if TYPE_CHECKING:
    from autot.src.download import Transmission


class BaseModel(models.Model):
    """base model to enherit from"""

    CONFIG: ConfigType = get_config()
    IMAGE_SIZE: None | tuple[int, int] = None

    remote_server_id = models.CharField(max_length=255, verbose_name="ID on remote server")
    remote_server_url = models.URLField(null=True, blank=True, verbose_name="URL on remote server")
    date_added = models.DateTimeField(auto_now_add=True, verbose_name="Date added")
    date_modified = models.DateTimeField(auto_now=True, verbose_name="Date modified")
    release_date = models.DateTimeField(null=True, blank=True, verbose_name="Release name")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="End date")
    description = models.TextField(null=True, blank=True, verbose_name="Description")

    class Meta:
        """set abstract to not create db relations"""

        abstract = True

    def crop_image(self, image_io: BytesIO) -> bytes:
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
            to_crop = int((img.height - (img.width / target_aspect)) / 2)
            borders = (0, to_crop, img.width, img.height - to_crop)
        else:
            # crop left and right
            to_crop = int((img.width - img.height * target_aspect) / 2)
            borders = (to_crop, 0, img.width - to_crop, img.height)

        img = img.crop(borders)
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        buffer.seek(0)

        return buffer.getvalue()

    def get_image_blur(self, to_blur: bytes) -> str:
        """create image blur"""
        with Image.open(to_blur) as image:
            blurred_image = image.filter(ImageFilter.GaussianBlur(10))
            blurred_image.thumbnail((100, 100))
            buffer = BytesIO()
            blurred_image.save(buffer, format="JPEG")
            img_base64 = base64.b64encode(buffer.getvalue()).decode()

        image_blur = f"data:image/jpg;base64,{img_base64}"
        return image_blur

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


class TVShow(BaseModel):
    """describes a show"""

    TRACK_CHANGES = True
    SHOW_STATUS = [
        ("r", "Running"),
        ("e", "Ended"),
        ("d", "In Development"),
        ("t", "To Be Determined"),
    ]
    IMAGE_SIZE = (2160, 2880)

    name = models.CharField(max_length=255)
    search_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(choices=SHOW_STATUS, max_length=1, null=True, blank=True)
    is_daily = models.BooleanField(default=False)
    show_time_zone = models.CharField(max_length=255, default="UTC")
    search_keywords = models.ManyToManyField(SearchWord)
    is_active = models.BooleanField(default=True)
    image_show = models.ForeignKey(
        Artwork,
        related_name="image_show",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Show Poster",
    )
    episode_fallback = models.ForeignKey(
        Artwork,
        related_name="episode_fallback",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Episode Fallback Art",
    )
    season_fallback = models.ForeignKey(
        Artwork,
        related_name="season_fallback",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Season Fallback Art",
    )

    def __str__(self):
        """set string representation"""
        return f"{self.name}"

    def delete(self, *args, **kwargs):
        """overwrite to delete image foreign keys"""
        try:
            if self.image_show:
                self.image_show.delete()
        except Artwork.DoesNotExist:
            pass

        try:
            if self.episode_fallback:
                self.episode_fallback.delete()
        except Artwork.DoesNotExist:
            pass

        try:
            if self.season_fallback:
                self.season_fallback.delete()
        except Artwork.DoesNotExist:
            pass

        super().delete(*args, **kwargs)

    def update_image_show(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_show:
            image_show, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.image_show = image_show
            self.save()
            log_change(self, "u", "image_show", new_value=image_url, comment="Added new image.")
            return

        if not self.image_show.image_url == image_url:
            self.image_show.update(image_url)
            log_change(self, "u", "image_show", new_value=image_url, comment="Updated image.")

    def update_episode_fallback(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.episode_fallback:
            episode_fallback, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.episode_fallback = episode_fallback
            self.save()
            log_change(self, "u", "episode_fallback", new_value=image_url, comment="Added new image.")
            return

        if not self.episode_fallback.image_url == image_url:
            self.episode_fallback.update(image_url)
            log_change(self, "u", "episode_fallback", new_value=image_url, comment="Updated image.")

    def update_season_fallback(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.season_fallback:
            season_fallback, _ = Artwork.objects.get_or_create(image_url=image_url)
            self.season_fallback = season_fallback
            self.save()
            log_change(self, "u", "season_fallback", new_value=image_url, comment="Added new image.")
            return

        if not self.season_fallback.image_url == image_url:
            self.season_fallback.update(image_url)
            log_change(self, "u", "season_fallback", new_value=image_url, comment="Updated image.")

    def get_keywords(self: Self):
        """build keywords of show"""
        # pylint: disable=E1101
        keywords = SearchWord.objects.none()
        for category in SearchWordCategory.objects.all():
            if self.search_keywords.filter(category=category).exists():
                keywords |= self.search_keywords.filter(category=category)
            else:
                keywords |= SearchWord.objects.filter(category=category, tv_default=True)

        return keywords.distinct()

    def get_archive_path(self) -> Path:
        """sanitize name"""
        return Path(sanitize_file_name(self.name))

    def get_all_episodes(self):
        """get all episodes of show reverse lookup"""
        return TVEpisode.objects.filter(season__show=self)

    def get_logs_related(self) -> QuerySet[ActionLog]:
        """get related log instances of show"""
        show_type = ContentType.objects.get_for_model(self)
        season_type = ContentType.objects.get_for_model(TVSeason)
        episode_type = ContentType.objects.get_for_model(TVEpisode)
        seasons = TVSeason.objects.filter(show=self)
        episodes = TVEpisode.objects.filter(season__show=self)

        show_logs = ActionLog.objects.filter(
            (
                Q(content_type=episode_type) & Q(object_id__in=episodes)
                | Q(content_type=season_type) & Q(object_id__in=seasons)
                | Q(content_type=show_type) & Q(object_id=self.pk)
            )
        ).order_by("-timestamp")

        return show_logs


class TVSeason(BaseModel):
    """describes a Season of a Show"""

    TRACK_CHANGES = True
    IMAGE_SIZE = (1000, 1500)

    number = models.IntegerField()
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    search_keywords = models.ManyToManyField(SearchWord)
    image_season = models.ForeignKey(
        Artwork, related_name="image_season", on_delete=models.CASCADE, null=True, blank=True
    )

    class Meta:
        unique_together = ("show", "number")

    def __str__(self):
        """set string representation"""
        return f"{self.show.name} S{str(self.number).zfill(2)}"

    def delete(self, *args, **kwargs):
        """overwrite to delete image foreign keys"""
        if self.image_season:
            self.image_season.delete()

        super().delete(*args, **kwargs)

    def update_image_season(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_season:
            self.image_season = Artwork(image_url=image_url)
            self.image_season.save()
            self.save()
            log_change(self, "u", "image_season", new_value=image_url, comment="Added new image.")
            return

        if not self.image_season.image_url == image_url:
            self.image_season.update(image_url)
            log_change(self, "u", "image_season", new_value=image_url, comment="Updated image.")

    def get_archive_path(self) -> str:
        """get archive path of season"""
        return self.show.get_archive_path() / f"Season {self.number}"

    def get_keywords(self: Self):
        """build keywords of show"""
        # pylint: disable=E1101
        keywords = SearchWord.objects.none()
        for category in SearchWordCategory.objects.all():
            if self.search_keywords.filter(category=category).exists():
                keywords |= self.search_keywords.filter(category=category)
            elif self.show.search_keywords.filter(category=category).exists():
                keywords |= self.show.search_keywords.filter(category=category)
            else:
                keywords |= SearchWord.objects.filter(category=category, tv_default=True)

        return keywords.distinct()

    @property
    def search_query(self) -> str:
        """search for season"""
        show_name = self.show.search_name or self.show.name

        return f"{show_name} S{str(self.number).zfill(2)} COMPLETE"

    def add_magnet(self, magnet: str, tm_instance: "Transmission") -> None:
        """add magnet to all episodes in season"""
        episodes = TVEpisode.objects.filter(season=self)

        for episode in episodes:
            episode.add_magnet(magnet, torrent_type="s")

        episodes.update(status="d", media_server_id=None, media_server_meta=None)
        log_change(self, "c", comment="Added season Torrent.")

    def is_valid_path(self, path) -> bool:
        """check for valid season path"""
        has_complete = "complete" in path.lower()

        return has_complete

    def get_logs_related(self) -> QuerySet[ActionLog]:
        """get related log instances of season"""
        season_type = ContentType.objects.get_for_model(self)
        episode_type = ContentType.objects.get_for_model(TVEpisode)
        season_episodes = TVEpisode.objects.filter(season=self)
        season_logs = ActionLog.objects.filter(
            (
                Q(content_type=episode_type) & Q(object_id__in=season_episodes)
                | Q(content_type=season_type) & Q(object_id=self.pk)
            )
        ).order_by("-timestamp")

        return season_logs


class TVEpisode(BaseModel):
    """describes an Episode of a Season of a Show"""

    TRACK_CHANGES = True
    IMAGE_SIZE = (1920, 1080)
    EPISODE_STATUS = [
        ("u", "Upcoming"),
        ("s", "Searching"),
        ("d", "Downloading"),
        ("f", "Finished"),
        ("a", "Archived"),
        ("i", "Ignored"),
    ]

    number = models.IntegerField()
    title = models.CharField(max_length=255)
    season = models.ForeignKey(TVSeason, on_delete=models.CASCADE)
    media_server_id = models.CharField(max_length=255, null=True, blank=True)
    media_server_meta = models.JSONField(null=True, blank=True)
    status = models.CharField(choices=EPISODE_STATUS, max_length=1, null=True, blank=True)
    torrent = models.ManyToManyField(Torrent, related_name="torrent_tv")
    search_keywords = models.ManyToManyField(SearchWord)
    image_episode = models.ForeignKey(
        Artwork, related_name="image_episode", on_delete=models.CASCADE, null=True, blank=True
    )

    class Meta:
        unique_together = ("season", "number")

    def __str__(self):
        """set string representation"""
        return self.file_name

    def delete(self, *args, **kwargs):
        """overwrite to delete image foreign keys"""
        if self.image_episode:
            self.image_episode.delete()

        super().delete(*args, **kwargs)

    def update_image_episode(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_episode:
            self.image_episode = Artwork(image_url=image_url)
            self.image_episode.save()
            self.save()
            log_change(self, "u", "image_episode", new_value=image_url, comment="Added new image.")
            return

        if not self.image_episode.image_url == image_url:
            self.image_episode.update(image_url)
            log_change(self, "u", "image_episode", new_value=image_url, comment="Updated image.")

    def get_keywords(self: Self):
        """build keywords of show"""
        # pylint: disable=E1101
        keywords = SearchWord.objects.none()
        for category in SearchWordCategory.objects.all():
            if self.search_keywords.filter(category=category).exists():
                keywords |= self.search_keywords.filter(category=category)
            elif self.season.search_keywords.filter(category=category).exists():
                keywords |= self.season.search_keywords.filter(category=category)
            elif self.season.show.search_keywords.filter(category=category).exists():
                keywords |= self.season.show.search_keywords.filter(category=category)
            else:
                keywords |= SearchWord.objects.filter(category=category, tv_default=True)

        return keywords.distinct()

    @property
    def identifier(self) -> str:
        """build S00E00 identifier"""
        return f"S{str(self.season.number).zfill(2)}E{str(self.number).zfill(2)}"

    @property
    def identifier_date(self) -> str:
        """date yyyy.mm.dd identifier"""
        time_zone = pytz.timezone(self.season.show.show_time_zone)
        return self.release_date.astimezone(time_zone).strftime("%Y.%m.%d")  # pylint: disable=no-member

    @property
    def search_query(self) -> str:
        """build search query"""
        show_search = self.season.show.search_name or self.season.show.name
        if self.season.show.is_daily:
            seach_identifier = self.identifier_date
        else:
            seach_identifier = self.identifier

        return f"{show_search} {seach_identifier}"

    @property
    def file_name(self) -> str:
        """build clean filename"""
        show_name = sanitize_file_name(self.season.show.name)
        title = sanitize_file_name(self.title)
        return f"{show_name} - {self.identifier} - {title}"

    @property
    def media_server_url(self) -> str | None:
        """url in media server"""
        if not self.media_server_id:
            return None

        base_url = self.CONFIG["JF_URL"]
        return f"{base_url}/web/#/details?id={self.media_server_id}"

    def get_archive_path(self, suffix: str | None = None) -> Path:
        """build archive path"""
        path = self.season.get_archive_path() / self.file_name
        if suffix:
            path = Path(f"{path}{suffix}")

        return path

    def is_valid_path(self, path: str) -> bool:
        """check if path is valid"""
        season_number = self.season.number
        episode_number = self.number

        if self.identifier_date in path:
            return True

        pattern_s = re.compile(rf"s0?{season_number}e0?{episode_number}", re.IGNORECASE)
        if pattern_s.search(path):
            return True

        pattern_x = re.compile(rf"0?{season_number}x0?{episode_number}", re.IGNORECASE)
        if pattern_x.search(path):
            return True

        return False

    def reset_download(self) -> None:
        """reset torrent and state"""
        self.torrent.update(torrent_state="i")
        self.status = None
        self.media_server_id = None
        self.media_server_meta = None
        self.save()

    def add_magnet(self, magnet, torrent_type="e") -> None:
        """add magnet to episode"""
        from autot.src.download import Transmission

        to_cancel = self.torrent.exclude(torrent_state="i")
        for torrent in to_cancel:
            Transmission().cancel(torrent)

        torrent, _ = Torrent.objects.get_or_create(magnet=magnet, torrent_type=torrent_type)
        self.torrent.add(torrent)
        self.status = "d"
        self.media_server_id = None
        self.media_server_meta = None
        self.save()
        log_change(self, action="c", field_name="torrent", new_value=torrent.magnet_hash)

    def get_next(self) -> Self | None:
        """get next episode for nav"""
        next_episode = TVEpisode.objects.filter(season=self.season, number=self.number + 1).first()
        if next_episode:
            return next_episode

        next_season = TVSeason.objects.filter(show=self.season.show, number=self.season.number + 1).first()
        if next_season:
            next_episode = TVEpisode.objects.filter(season=next_season, number=1).first()
            if next_episode:
                return next_episode

        return None

    def get_previous(self) -> Self | None:
        """Get previous episode for navigation."""
        previous_episode = TVEpisode.objects.filter(season=self.season, number=self.number - 1).first()
        if previous_episode:
            return previous_episode

        previous_season = TVSeason.objects.filter(show=self.season.show, number=self.season.number - 1).first()
        if previous_season:
            previous_episode = TVEpisode.objects.filter(season=previous_season).order_by("-number").first()
            if previous_episode:
                return previous_episode

        return None


@receiver(post_delete, sender=TVShow)
def delete_show_images(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """signal for deleting show images"""
    if instance.image_show:
        instance.image_show.delete()
    if instance.episode_fallback:
        instance.episode_fallback.delete()
    if instance.season_fallback:
        instance.season_fallback.delete()


@receiver(post_delete, sender=TVSeason)
def delete_season_images(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """signal for deleting season images"""
    if instance.image_season:
        instance.image_season.delete()


@receiver(post_delete, sender=TVEpisode)
def delete_torrent(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete torrent if not used else where"""
    if not instance.torrent.exists():
        return

    torrents = TVEpisode.objects.filter(torrent__in=instance.torrent.all())
    for torrent in torrents:
        if not TVEpisode.objects.filter(torrent=torrent):
            torrent.delete()


@receiver(post_delete, sender=TVEpisode)
def delete_episode_images(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """signal for deleting episode images"""
    if instance.image_episode:
        instance.image_episode.delete()
