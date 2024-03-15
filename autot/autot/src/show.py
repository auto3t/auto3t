"""all show related functionality"""

from datetime import datetime
from urllib import parse

from django.db.models import QuerySet
from django.utils import timezone
from autot.models import TVEpisode, TVShow, TVSeason
from autot.src.client_tvmaze import TVMaze


class TVMazeShow:
    """tvmaze remote implementation"""

    def __init__(self, show_id: int):
        self.show_id = show_id

    def validate(self) -> None:
        """import show as needed"""
        show: TVShow = self.get_show()
        seasons: QuerySet[TVSeason] = self.check_seasons(show)
        self.check_episodes(seasons)

    def get_show(self) -> TVShow:
        """get or create show"""
        response = self._get_remote_show()
        show_data = self._parse_show(response)
        show, created = TVShow.objects.update_or_create(**show_data)
        if created:
            print(f"created new show: {show}")

        return show

    def _get_remote_show(self) -> dict:
        """get show from tvmaze api"""
        url = f"shows/{self.show_id}"

        response = TVMaze().get(url)
        if not response:
            raise ValueError

        return response

    def _parse_show(self, response: dict) -> dict:
        """parse API response to model"""
        show_data = {
            "remote_server_id": response["id"],
            "release_date": self._get_date_time(response.get("premiered")),
            "end_date": self._get_date_time(response.get("ended")),
            "description": response["summary"],
            "name": response["name"],
            "status": self._parse_show_status(response["status"]),
            "image_url": self._get_image_url(response),
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
            season, created = TVSeason.objects.update_or_create(**season_data)
            if created:
                print(f"created new season: {season}")

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
            "remote_server_id": response["id"],
            "release_date": self._get_date_time(response.get("premiereDate")),
            "end_date": self._get_date_time(response.get("endDate")),
            "description": response["summary"],
            "image_url": self._get_image_url(response),
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
            episode, created = TVEpisode.objects.update_or_create(**episode_data)
            if created:
                print(f"created new episode {episode}")

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
            "remote_server_id": response["id"],
            "release_date": self._get_date_time(response.get("airstamp")),
            "description": response["summary"],
            "image_url": self._get_image_url(response),
            "number": response["number"],
            "title": response["name"],
            "season": season,
        }
        if season.end_date and timezone.now() > season.end_date:
            episode_data.update({"status": "i"})

        return episode_data

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

        if not "T" in date_response:
            date_response = f"{date_response}T00:00:00+00:00"

        date_time_obj = datetime.fromisoformat(date_response)

        return date_time_obj


class ShowId:
    """search show in tvmaze"""

    def search(self, query_raw: str) -> list[dict] | None:
        """search in api"""
        query_encoded = parse.quote(query_raw)
        options = self.get_options(query_encoded)

        return options

    def get_options(self, query_encoded) -> list[dict] | None:
        """get list of matching options"""
        url = f"search/shows?q={query_encoded}"
        response = TVMaze().get(url)
        if not response:
            return None

        options = [self.parse_result(i) for i in response]

        return options

    def parse_result(self, result: dict) -> dict:
        """parse single result"""
        result = result["show"]
        show_data = {
            "id": result["id"],
            "name": result["name"],
            "url": result["url"],
            "genres": result["genres"],
            "status": result["status"],
            "summary": result["summary"],
        }
        if "premiered" in result:
            show_data.update({"premiered": result["premiered"]})

        if "ended" in result:
            show_data.update({"ended": result["ended"]})

        return show_data
