"""read environment value config, static at app startup"""

from os import environ
from pathlib import Path
from typing import TypedDict


class ConfigType(TypedDict):
    """represent config type"""

    MEDIA_EXT: list[str]
    MEDIA_MIN_SIZE: int
    JF_URL: str
    JF_PROXY_URL: str
    JF_API_KEY: str
    PRR_URL: str
    PRR_KEY: str
    MOVIE_DB_API_KEY: str
    REDIS_CON: str
    REDIS_NAME_SPACE: str
    TM_URL: str
    TM_PORT: int
    TM_USER: str
    TM_PASS: str
    TM_BASE_FOLDER: Path
    TV_BASE_FOLDER: Path
    MOVIE_BASE_FOLDER: Path
    APP_ROOT: Path | None
    TZ: str
    DJANGO_DEBUG: bool


def get_config() -> ConfigType:
    """get config"""
    config: ConfigType = {
        "MEDIA_EXT": ["mp4", "mkv", "avi", "m4v"],
        "MEDIA_MIN_SIZE": 50000000,
        "JF_URL": environ["JF_URL"],
        "JF_PROXY_URL": environ.get("JF_PROXY_URL") or environ["JF_URL"],
        "JF_API_KEY": environ["JF_API_KEY"],
        "PRR_URL": environ["PRR_URL"],
        "PRR_KEY": environ["PRR_KEY"],
        "MOVIE_DB_API_KEY": environ["MOVIE_DB_API_KEY"],
        "REDIS_CON": environ.get("REDIS_CON") or "redis://localhost:6379",
        "REDIS_NAME_SPACE": "tt:",
        "TM_URL": environ["TM_URL"],
        "TM_PORT": int(environ["TM_PORT"]),
        "TM_USER": environ["TM_USER"],
        "TM_PASS": environ["TM_PASS"],
        "TM_BASE_FOLDER": Path(environ["TM_BASE_FOLDER"]),
        "TV_BASE_FOLDER": Path(environ["TV_BASE_FOLDER"]),
        "MOVIE_BASE_FOLDER": Path(environ["MOVIE_BASE_FOLDER"]),
        "APP_ROOT": Path(environ["APP_ROOT"]) if environ.get("APP_ROOT") else None,
        "TZ": environ.get("TZ", "UTC"),
        "DJANGO_DEBUG": bool(environ.get("DJANGO_DEBUG", False)),
    }

    return config
