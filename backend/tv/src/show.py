"""all show related functionality"""

import re
from datetime import datetime, timedelta

import pytz
from artwork.models import Artwork
from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet
from django.utils import timezone
from people.models import Credit
from people.src.tv_person import TVPerson
from tv.models import TVEpisode, TVSeason, TVShow
from tv.src.tv_maze_client import TVMaze

from autot.models import log_change
from autot.src.media_server import MediaServerIdentify
from autot.static import TvShowStatus


class TVMazeShow:
    """tvmaze remote implementation"""

    def __init__(self, tvmaze_id: str):
        self.tvmaze_id = tvmaze_id
        self.timezone = pytz.timezone("UTC")

    def validate(self) -> None:
        """import show as needed"""
        show: TVShow = self.get_show()
        seasons: QuerySet[TVSeason] = self.check_seasons(show)
        self.check_episodes(seasons)
        self.get_show_credits(show)

    def get_show(self, is_active: bool = True) -> TVShow:
        """get or create show"""
        response = self._get_remote_show()
        self._get_time_zone(response)
        show_data = self._parse_show(response)

        try:
            show = TVShow.objects.get(tvmaze_id=self.tvmaze_id)
        except TVShow.DoesNotExist:
            show = TVShow.objects.create(**show_data)
            image_show = self._get_image_url(response)
            if image_show:
                show.image_show, _ = Artwork.objects.get_or_create(image_url=image_show)

            episode_fallback = self._get_fallback(response, "background")
            if episode_fallback:
                show.episode_fallback, _ = Artwork.objects.get_or_create(image_url=episode_fallback)

            season_fallback = self._get_fallback(response, "poster")
            if season_fallback:
                show.season_fallback, _ = Artwork.objects.get_or_create(image_url=season_fallback)

            show.is_active = is_active
            show.save()

            return show

        fields_changed = False
        for key, value in show_data.items():
            old_value = getattr(show, key)
            if old_value != value:
                log_change(show, "u", field_name=key, old_value=old_value, new_value=value)
                setattr(show, key, value)
                fields_changed = True

        if fields_changed:
            show.save()

        image_show = self._get_image_url(response)
        show.update_image_show(image_show)

        episode_fallback = self._get_fallback(response, "background")
        show.update_episode_fallback(episode_fallback)

        season_fallback = self._get_fallback(response, "poster")
        show.update_season_fallback(season_fallback)

        show.refresh_from_db()

        return show

    def _get_remote_show(self) -> dict:
        """get show from tvmaze api"""
        url = f"shows/{self.tvmaze_id}?embed=images"

        response = TVMaze().get(url)
        if not response or not isinstance(response, dict):
            raise ValueError

        return response

    def _get_time_zone(self, response: dict) -> None:
        """set show time zone if available"""
        if response.get("network"):
            show_time_zone = response["network"]["country"].get("timezone")
            if show_time_zone:
                self.timezone = pytz.timezone(show_time_zone)

    def _parse_show(self, response: dict) -> dict:
        """parse API response to model"""
        show_data = {
            "tvmaze_id": str(response["id"]),
            "imdb_id": response.get("externals", {}).get("imdb"),
            "remote_server_url": response["url"],
            "release_date": self._get_date_time(response.get("premiered")),
            "end_date": self._get_date_time(response.get("ended")),
            "description": response["summary"],
            "name": response["name"],
            "status": self._parse_show_status(response),
            "show_time_zone": self.timezone.zone,
        }
        if len(response["schedule"].get("days", [])) > 2:
            show_data.update({"is_daily": True})

        return show_data

    @staticmethod
    def _parse_show_status(response) -> str:
        """parse status"""
        for key in TvShowStatus:
            if key.value == response["status"]:
                return key.name

        raise ValueError("did not find status choice")

    def _get_fallback(self, response, art_type) -> str | None:
        """episode fallback"""
        images = response.get("_embedded", {}).get("images")
        if not images:
            return None

        matches = [i for i in images if i["type"] == art_type]
        if not matches:
            return None

        url = matches[0]["resolutions"]["original"]["url"]
        return url

    def check_seasons(self, show: TVShow) -> QuerySet[TVSeason]:
        """import seasons as needed"""
        seasons_remote = self._get_remote_seasons()
        for season_response in seasons_remote:
            season_data = self._parse_season(season_response, show)

            try:
                season = TVSeason.objects.get(show=show, number=season_response["number"])
            except TVSeason.DoesNotExist:
                season = TVSeason.objects.create(**season_data)
                image_season = self._get_image_url(season_response)
                if image_season:
                    season.image_season, _ = Artwork.objects.get_or_create(image_url=image_season)
                    season.image_season.save()

                season.save()

                continue

            fields_changed = False
            for key, value in season_data.items():
                old_value = getattr(season, key)
                if old_value != value:
                    log_change(season, "u", field_name=key, old_value=old_value, new_value=value)
                    setattr(season, key, value)
                    fields_changed = True

            if fields_changed:
                season.save()

            image_season = self._get_image_url(season_response)
            season.update_image_season(image_season)

        seasons = TVSeason.objects.filter(show=show)

        return seasons

    def _get_remote_seasons(self) -> list:
        """get season of show"""
        url = f"shows/{self.tvmaze_id}/seasons"
        response = TVMaze().get(url)

        if not response or not isinstance(response, list):
            raise ValueError

        return response

    def _parse_season(self, season_response: dict, show: TVShow) -> dict:
        """parse seasons"""
        season_data = {
            "tvmaze_id": str(season_response["id"]),
            "remote_server_url": season_response["url"],
            "release_date": self._get_date_time(season_response.get("premiereDate")),
            "end_date": self._get_date_time(season_response.get("endDate")),
            "description": season_response["summary"],
            "number": season_response["number"],
            "show": show,
        }

        return season_data

    def check_episodes(self, seasons: QuerySet[TVSeason]) -> None:
        """validate show episodes"""
        episode_remote = self._get_remote_episodes()
        if not episode_remote:
            return

        to_refresh = set()

        for episode_response in episode_remote:
            season = seasons.get(number=episode_response["season"])
            episode_data = self._parse_episode(episode_response, season)

            try:
                episode = TVEpisode.objects.get(season=season, number=episode_data["number"])
            except TVEpisode.DoesNotExist:
                episode = TVEpisode.objects.create(**episode_data)
                image_episode = self._get_image_url(episode_response)
                if image_episode:
                    episode.image_episode, _ = Artwork.objects.get_or_create(image_url=image_episode)
                    episode.image_episode.save()

                self._set_episode_status(episode)
                episode.save()
                continue

            fields_changed = False
            for key, value in episode_data.items():
                old_value = getattr(episode, key)
                if old_value != value:
                    log_change(episode, "u", field_name=key, old_value=old_value, new_value=value)
                    setattr(episode, key, value)
                    fields_changed = True
                    if episode.media_server_id:
                        to_refresh.add(episode.media_server_id)

            if fields_changed:
                episode.save()

            image_episode = self._get_image_url(episode_response)
            episode.update_image_episode(image_episode)

        MediaServerIdentify().refresh(to_refresh)

    def _get_remote_episodes(self) -> list | None:
        """get episodes of show"""
        url = f"shows/{self.tvmaze_id}/episodes"
        response = TVMaze().get(url)

        if not response or not isinstance(response, list):
            return None

        return response

    def _parse_episode(self, episode_response: dict, season: TVSeason) -> dict:
        """parse episodes"""
        episode_data = {
            "tvmaze_id": str(episode_response["id"]),
            "remote_server_url": episode_response["url"],
            "release_date": self._get_date_time(episode_response.get("airstamp")),
            "runtime": episode_response.get("runtime"),
            "description": episode_response["summary"],
            "number": episode_response["number"],
            "title": episode_response["name"],
            "season": season,
        }

        return episode_data

    def _set_episode_status(self, episode: TVEpisode) -> None:
        """set status for new episodes"""
        cutoff = timezone.now() - timedelta(days=365)
        if episode.season.end_date and cutoff > episode.season.end_date:
            episode.status = "i"

    def _get_image_url(self, response) -> str | None:
        """extract image url from response, if available"""
        image = response["image"]
        if not image:
            return None

        return image.get("original")

    def _get_date_time(self, date_response: None | str) -> datetime | None:
        """build date time if possible"""
        if not date_response:
            return None

        date_time_obj = datetime.fromisoformat(date_response)
        if not timezone.is_aware(date_time_obj):
            date_time_obj = timezone.make_aware(date_time_obj, timezone=self.timezone)

        return date_time_obj

    def get_show_credits(self, show: TVShow):
        """get show credits"""
        credit_list = []

        cast_response = self._get_remote_show_cast()
        for cast_member in cast_response:
            credit = self._build_cast_credit(show_id=show.id, member=cast_member, role="main_cast")
            credit_list.append(credit)

        crew_response = self._get_remote_show_crew()

        for crew_member in crew_response:
            if not re.match(r".*producer.*|.*writer.*|.*director.*", crew_member["type"].lower()):
                continue

            credit = self._buil_crew_credit(show_id=show.id, member=crew_member)
            credit_list.append(credit)

        show.credit.set(credit_list)

    def _get_remote_show_cast(self) -> list:
        """get cast from remote"""
        url = f"shows/{self.tvmaze_id}/cast"
        response = TVMaze().get(url)
        if not response or not isinstance(response, list):
            return []

        return response

    def _get_remote_show_crew(self) -> list:
        """get remote show crew"""
        url = f"shows/{self.tvmaze_id}/crew"
        response = TVMaze().get(url)
        if not response or not isinstance(response, list):
            return []

        return response

    def _build_cast_credit(self, show_id, member, role):
        """build show cast credit"""
        person = TVPerson(tvmaze_person_id=member["person"]["id"]).get_or_create()
        credit_data = {
            "person": person,
            "role": role,
            "role_name": member["character"].get("name"),
            "content_type": ContentType.objects.get_for_model(TVShow),
            "object_id": show_id,
        }
        credit, _ = Credit.objects.get_or_create(**credit_data)

        return credit

    def _buil_crew_credit(self, show_id, member):
        """build crew credit"""
        person = TVPerson(tvmaze_person_id=member["person"]["id"]).get_or_create()
        credit_data = {
            "person": person,
            "role": "crew",
            "role_name": member.get("type"),
            "content_type": ContentType.objects.get_for_model(TVShow),
            "object_id": show_id,
        }
        credit, _ = Credit.objects.get_or_create(**credit_data)

        return credit
