"""collection of helper functions"""

import logging
import re
from urllib.parse import parse_qs

import requests
from django.conf import settings

logger = logging.getLogger("django")


def sanitize_file_name(filename: str) -> str:
    """replace illegal characters"""
    illegal_chars_pattern = r'[\\/:"*?&<>|]|\.{2,}'
    sanitized_filename = re.sub(illegal_chars_pattern, "-", filename)

    return sanitized_filename


def get_magnet_hash(magnet: str) -> str:
    """extract manget hash out of magnet URL"""
    qs_parsed = parse_qs(magnet)
    if not qs_parsed:
        raise ValueError

    magnets = qs_parsed.get("magnet:?xt")
    if not magnets:
        raise ValueError

    return magnets[0].split(":")[-1].lower()


def get_tracker_list() -> list[str]:
    """get tracker lists"""
    response = requests.get(settings.AUTOT_TRACKER_URL, timeout=300)
    if not response.ok:
        logger.error("failed to get tracker fallback: status %s, error: %s", response.status_code, response.text)
        return []

    return response.text.split()


def title_clean(title) -> str:
    """clean torrent title string"""
    return title.lower().replace(".", " ").replace(":", "").replace(" & ", " ").replace("!", "")
