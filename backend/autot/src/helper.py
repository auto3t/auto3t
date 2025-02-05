"""collection of helper functions"""

import re
from urllib.parse import parse_qs


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
