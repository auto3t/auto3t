"""all tv models"""

import re
from pathlib import Path
from typing import Self

import pytz
from artwork.models import Artwork
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from people.models import Credit
from rapidfuzz import fuzz

from autot.models import SearchWord, SearchWordCategory, Torrent, log_change
from autot.src.config import ConfigType, get_config
from autot.src.helper import sanitize_file_name, title_clean
from autot.static import TvEpisodeStatus, TvShowStatus


class BaseModel(models.Model):
    """base model to enherit from"""

    CONFIG: ConfigType = get_config()
    FUZZY_RATIO = 95

    tvmaze_id = models.CharField(max_length=255, verbose_name="ID on remote server")
    remote_server_url = models.URLField(null=True, blank=True, verbose_name="URL on remote server")
    date_added = models.DateTimeField(auto_now_add=True, verbose_name="Date added")
    date_modified = models.DateTimeField(auto_now=True, verbose_name="Date modified")
    release_date = models.DateTimeField(null=True, blank=True, verbose_name="Release name")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="End date")
    description = models.TextField(null=True, blank=True, verbose_name="Description")

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


class TVShow(BaseModel):
    """describes a show"""

    TRACK_CHANGES = True

    name = models.CharField(max_length=255)
    imdb_id = models.CharField(255, unique=True, null=True, blank=True)
    search_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(choices=TvShowStatus.choices(), max_length=1, null=True, blank=True)
    is_daily = models.BooleanField(default=False)
    show_time_zone = models.CharField(max_length=255, default="UTC")
    credit = models.ManyToManyField(Credit)
    search_keywords = models.ManyToManyField(SearchWord)
    is_active = models.BooleanField(default=True)
    image_show = models.ForeignKey(
        Artwork,
        related_name="image_show",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Show Poster",
    )
    episode_fallback = models.ForeignKey(
        Artwork,
        related_name="episode_fallback",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Episode Fallback Art",
    )
    season_fallback = models.ForeignKey(
        Artwork,
        related_name="season_fallback",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Season Fallback Art",
    )

    class Meta:
        verbose_name = "TV Show"
        verbose_name_plural = "TV Shows"

    def __str__(self):
        """set string representation"""
        return f"{self.name}"

    @property
    def search_query(self) -> str:
        """search for season"""
        show_name = self.search_name or self.name

        return f"{show_name} COMPLETE"

    @property
    def credit_main_cast_count(self) -> int:
        """count for credit main cast"""
        return self.credit.filter(role="main_cast").count()  # pylint: disable=no-member

    @property
    def credit_crew_count(self) -> int:
        """count for credit main cast"""
        return self.credit.filter(role="crew").count()  # pylint: disable=no-member

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
            self.save()
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
            self.save()
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
            self.save()
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

    def add_magnet(self, magnet: str, title: str | None) -> None:
        """add magnet to all episodes in season"""
        if not self.status == "e":
            raise ValueError("can't add show torrent for show not ended")

        episodes = TVEpisode.objects.filter(season__show=self)

        for episode in episodes:
            episode.add_magnet(magnet, title, torrent_type="w")

        episodes.update(status="d", media_server_id=None, media_server_meta=None)
        log_change(self, "c", comment="Added Show Torrent.")


class TVSeason(BaseModel):
    """describes a Season of a Show"""

    TRACK_CHANGES = True

    number = models.IntegerField()
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    search_keywords = models.ManyToManyField(SearchWord)
    image_season = models.ForeignKey(
        Artwork, related_name="image_season", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        unique_together = ("show", "number")

    def __str__(self):
        """set string representation"""
        return f"{self.show.name} S{str(self.number).zfill(2)}"

    def update_image_season(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_season:
            self.image_season, _ = Artwork.objects.get_or_create(image_url=image_url)
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

    def add_magnet(self, magnet: str, title: str | None) -> None:
        """add magnet to all episodes in season"""
        episodes = TVEpisode.objects.filter(season=self)

        for episode in episodes:
            episode.add_magnet(magnet, title, torrent_type="s")

        episodes.update(status="d", media_server_id=None, media_server_meta=None)
        log_change(self, "c", comment="Added season Torrent.")

    def is_valid_path(self, path, strict: bool = False) -> bool:
        """check for valid season path"""
        path_clean = title_clean(path)
        has_complete = "complete" in path_clean

        if strict:
            close_enough = fuzz.partial_ratio(self.search_query.lower(), path_clean) > self.FUZZY_RATIO
            if not close_enough:
                return False

        return has_complete


class TVEpisode(BaseModel):
    """describes an Episode of a Season of a Show"""

    TRACK_CHANGES = True

    number = models.IntegerField()
    title = models.CharField(max_length=255)
    runtime = models.PositiveIntegerField(null=True, blank=True)
    season = models.ForeignKey(TVSeason, on_delete=models.CASCADE)
    media_server_id = models.CharField(max_length=255, null=True, blank=True)
    media_server_meta = models.JSONField(null=True, blank=True)
    status = models.CharField(choices=TvEpisodeStatus.choices(), max_length=1, null=True, blank=True)
    torrent = models.ManyToManyField(Torrent, related_name="torrent_tv")
    search_keywords = models.ManyToManyField(SearchWord)
    image_episode = models.ForeignKey(
        Artwork, related_name="image_episode", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        unique_together = ("season", "number")

    def __str__(self):
        """set string representation"""
        return self.file_name

    def update_image_episode(self, image_url: str | None) -> None:
        """handle update with or without existing"""
        if not image_url:
            return

        if not self.image_episode:
            self.image_episode, _ = Artwork.objects.get_or_create(image_url=image_url)
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

        base_url = self.CONFIG["JF_PROXY_URL"]
        return f"{base_url}/web/#/details?id={self.media_server_id}"

    def get_archive_path(self, suffix: str | None = None) -> Path:
        """build archive path"""
        path = self.season.get_archive_path() / self.file_name
        if suffix:
            path = Path(f"{path}{suffix}")

        return path

    def is_valid_path(self, path: str, strict: bool = False) -> bool:
        """check if path is valid"""
        season_number = self.season.number
        episode_number = self.number

        path_clean = title_clean(path)

        if strict:
            if self.season.show.is_daily:
                to_search = title_clean(self.search_query)
            else:
                to_search = self.search_query.lower()

            close_enough = fuzz.partial_ratio(to_search, path_clean) > self.FUZZY_RATIO
            if not close_enough:
                return False

        if title_clean(self.identifier_date) in path_clean:
            return True

        pattern_s = re.compile(rf"s0?{season_number}e0?{episode_number}", re.IGNORECASE)
        if pattern_s.search(path_clean):
            return True

        pattern_x = re.compile(rf"0?{season_number}x0?{episode_number}", re.IGNORECASE)
        if pattern_x.search(path_clean):
            return True

        return False

    def reset_download(self) -> None:
        """reset torrent and state"""
        self.torrent.filter(torrent_state__in=["u", "q", "d"]).update(  # pylint: disable=no-member
            torrent_state="i", progress=None
        )
        self.status = None
        self.media_server_id = None
        self.media_server_meta = None
        self.save()
        log_change(self, "u", comment="Cancel Torrent Download")

    def add_magnet(self, magnet, title, torrent_type="e") -> None:
        """add magnet to episode"""
        from autot.src.download import Transmission

        to_cancel = self.torrent.exclude(torrent_state="i")  # pylint: disable=no-member
        for torrent in to_cancel:
            Transmission().cancel(torrent)

        torrent, _ = Torrent.objects.get_or_create(magnet=magnet, torrent_type=torrent_type)
        torrent.torrent_state = "u"
        torrent.title = title
        torrent.save()
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


@receiver(post_delete, sender=TVEpisode)
def delete_torrent(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete torrent if not used else where"""
    if not instance.torrent.exists():
        return

    for torrent in instance.torrent.all():
        if TVEpisode.objects.filter(torrent=torrent).count() == 1:
            torrent.delete()
