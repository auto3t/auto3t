"""startup checks"""

from os import environ
from time import sleep

from autot.src.download import Transmission
from autot.src.media_server import MediaServerIdentify
from autot.src.redis_con import RedisBase
from autot.src.search import SearchIndex
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    """command"""

    EXPECTED_ENV_VARS = {
        "REDIS_CON",
        "JF_URL",
        "JF_API_KEY",
        "PRR_URL",
        "PRR_KEY",
        "MOVIE_DB_API_KEY",
        "TM_URL",
        "TM_PORT",
        "TM_USER",
        "TM_PASS",
        "TM_BASE_FOLDER",
        "TV_BASE_FOLDER",
        "MOVIE_BASE_FOLDER",
    }

    def handle(self, *args, **options):
        """handle entry"""
        self._verify_env_vars()
        self._verify_redis_connection()
        self._verify_jf_connection()
        self._verify_prr_connection()
        self._verify_tm_connection()

    def _verify_env_vars(self):
        """verify expected env vars are set"""
        self.stdout.write("[0] verify environment variables")
        current = set(environ.keys())
        difference = self.EXPECTED_ENV_VARS.difference(current)
        if difference:
            message = f"    🗙 expected env var(s) not set:\n    {difference}"
            self.stdout.write(self.style.ERROR(message))
            sleep(60)
            raise CommandError(message)

        self.stdout.write(self.style.SUCCESS("    ✓ all expected env vars are set"))

    def _verify_redis_connection(self):
        """verify redis connection"""
        self.stdout.write("[1] connect to Redis")
        redis_conn = RedisBase().conn
        for _ in range(5):
            try:
                pong = redis_conn.execute_command("PING")
                if pong:
                    self.stdout.write(self.style.SUCCESS("    ✓ Redis connection verified"))
                    return

            except Exception:  # pylint: disable=broad-except
                self.stdout.write("    ... retry Redis connection")
                sleep(2)

        message = "    🗙 Redis connection failed"
        self.stdout.write(self.style.ERROR(f"{message}"))
        try:
            redis_conn.execute_command("PING")
        except Exception as err:  # pylint: disable=broad-except
            message = f"    🗙 {type(err).__name__}: {err}"
            self.stdout.write(self.style.ERROR(f"{message}"))

        sleep(60)
        raise CommandError(message)

    def _verify_jf_connection(self):
        """verify jellyfin connection details"""
        self.stdout.write("[2] connect to Jellyfin")
        try:
            system_info = MediaServerIdentify().make_request("System/Info", "GET")
        except ValueError as err:
            message = "    🗙 Jellyfin connection failed"
            self.stdout.write(self.style.ERROR(f"{message}"))
            self.stdout.write(self.style.ERROR(f"    {str(err)}"))
            sleep(60)
            raise CommandError(message) from err

        version = system_info.get("Version")
        server_name = system_info.get("ServerName")
        message = f"    ✓ Jellyfin connection verified: '{server_name}' running v{version}"
        self.stdout.write(self.style.SUCCESS(message))

    def _verify_prr_connection(self):
        """verify prowlarr connection details"""
        self.stdout.write("[3] connect to Prowlarr")
        try:
            SearchIndex().ping()
        except ValueError as err:
            message = "    🗙 Prowlarr connection failed"
            self.stdout.write(self.style.ERROR(f"{message}"))
            self.stdout.write(self.style.ERROR(f"    {str(err)}"))
            sleep(60)
            raise CommandError(message) from err

        self.stdout.write(self.style.SUCCESS("    ✓ Prowlarr connection verified"))

    def _verify_tm_connection(self):
        """verify transmission connection details"""
        self.stdout.write("[4] connect to Transmission")
        try:
            Transmission()
        except Exception as err:
            message = "    🗙 Transmission connection failed"
            self.stdout.write(self.style.ERROR(f"{message}"))
            self.stdout.write(self.style.ERROR(f"    {str(err)}"))
            sleep(60)
            raise CommandError(message) from err

        self.stdout.write(self.style.SUCCESS("    ✓ Transmission connection verified"))
