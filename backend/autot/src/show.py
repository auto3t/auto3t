"""all show related functionality"""

from datetime import datetime, timedelta

import pytz
from django.db.models import QuerySet
from django.utils import timezone
from autot import tasks
from autot.models import TVEpisode, TVShow, TVSeason
from autot.src.client_tvmaze import TVMaze


class TVMazeShow:
    """tvmaze remote implementation"""

    def __init__(self, show_id: str):
        self.show_id = show_id
        self.timezone = pytz.timezone("UTC")

    def validate(self) -> None:
        """import show as needed"""
        show: TVShow = self.get_show()
        seasons: QuerySet[TVSeason] = self.check_seasons(show)
        self.check_episodes(seasons)

    def get_show(self) -> TVShow:
        """get or create show"""
        response = self._get_remote_show()
        self._get_time_zone(response)
        show_data = self._parse_show(response)

        show, created = TVShow.objects.get_or_create(remote_server_id=self.show_id, defaults=show_data)
        if created:
            tasks.download_thumbnail.delay(show.remote_server_id, "show")
            print(f"created new show: {show.name}")
        else:
            fields_changed = False
            for key, value in show_data.items():
                if getattr(show, key) != value:
                    setattr(show, key, value)
                    print(f"{show.name}: update [{key}] to [{value}]")
                    fields_changed = True
                    if key == "image_url" and value:
                        tasks.download_thumbnail.delay(show.remote_server_id, "show")

            if fields_changed:
                show.save()

        return show

    def _get_remote_show(self) -> dict:
        """get show from tvmaze api"""
        url = f"shows/{self.show_id}"

        response = TVMaze().get(url)
        if not response:
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
            "remote_server_id": str(response["id"]),
            "release_date": self._get_date_time(response.get("premiered")),
            "end_date": self._get_date_time(response.get("ended")),
            "description": response["summary"],
            "name": response["name"],
            "status": self._parse_show_status(response["status"]),
            "image_url": self._get_image_url(response),
            "show_time_zone": self.timezone.zone,
        }
        if len(response["schedule"].get("days", [])) > 2:
            show_data.update({"is_daily": True})

        return show_data

    def _parse_show_status(self, status: str) -> str | None:
        """get show status"""
        matches = [i for i in TVShow.SHOW_STATUS if i[1] == status]
        if not matches:
            return None

        return matches[0][0]

    def check_seasons(self, show: TVShow) -> QuerySet[TVSeason]:
        """import seasons as needed"""
        seasons_remote = self._get_remote_seasons()
        for season_response in seasons_remote:
            season_data = self._parse_season(season_response, show)
            season, created = TVSeason.objects.get_or_create(
                number=season_data["number"], show=show, defaults=season_data
            )
            if created:
                tasks.download_thumbnail.delay(season.remote_server_id, "season")
                print(f"created new season: {season}")
            else:
                fields_changed = False
                for key, value in season_data.items():
                    if getattr(season, key) != value:
                        setattr(season, key, value)
                        print(f"{season}: update [{key}] to [{value}]")
                        fields_changed = True
                        if key == "image_url" and value:
                            tasks.download_thumbnail.delay(season.remote_server_id, "season")

                if fields_changed:
                    season.save()

        seasons = TVSeason.objects.filter(show=show)

        return seasons

    def _get_remote_seasons(self) -> dict:
        """get season of show"""
        url = f"shows/{self.show_id}/seasons"
        response = TVMaze().get(url)

        if not response:
            raise ValueError

        return response

    def _parse_season(self, response: dict, show: TVShow) -> dict:
        """parse seasons"""
        season_data = {
            "remote_server_id": str(response["id"]),
            "release_date": self._get_date_time(response.get("premiereDate")),
            "end_date": self._get_date_time(response.get("endDate")),
            "description": response["summary"],
            "image_url": self._get_image_url(response) or show.image_url,
            "number": response["number"],
            "show": show,
        }

        return season_data

    def check_episodes(self, seasons: QuerySet[TVSeason]) -> None:
        """validate show episodes"""
        episode_response = self._get_remote_episodes()
        for episode in episode_response:
            season = seasons.get(number=episode["season"])
            episode_data = self._parse_episode(episode, season)
            episode, created = TVEpisode.objects.get_or_create(
                number=episode_data["number"], season=season, defaults=episode_data
            )
            if created:
                self._set_episode_status(episode)
                tasks.download_thumbnail.delay(episode.remote_server_id, "episode")
                print(f"created new episode: {episode}")
            else:
                fields_changed = False
                for key, value in episode_data.items():
                    if getattr(episode, key) != value:
                        setattr(episode, key, value)
                        print(f"{episode}: update [{key}] to [{value}]")
                        fields_changed = True
                        if key == "image_url" and value:
                            tasks.download_thumbnail.delay(episode.remote_server_id, "episode")

                if fields_changed:
                    episode.save()

    def _get_remote_episodes(self) -> dict:
        """get episodes of show"""
        url = f"shows/{self.show_id}/episodes"
        response = TVMaze().get(url)

        if not response:
            raise ValueError

        return response

    def _parse_episode(self, response: dict, season: TVSeason) -> dict:
        """parse episodes"""
        episode_data = {
            "remote_server_id": str(response["id"]),
            "release_date": self._get_date_time(response.get("airstamp")),
            "description": response["summary"],
            "image_url": self._get_image_url(response),
            "number": response["number"],
            "title": response["name"],
            "season": season,
        }

        return episode_data

    def _set_episode_status(self, episode: TVEpisode) -> None:
        """set status for new episodes"""
        cutoff = timezone.now() + timedelta(days=365)
        if episode.season.end_date and cutoff > episode.season.end_date:
            episode.status = "i"
            episode.save()

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
