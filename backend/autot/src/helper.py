"""collection of helper functions"""

import re


def sanitize_file_name(filename: str) -> str:
    """replace illegal characters"""
    illegal_chars_pattern = r'[\\/:"*?&<>|]|\.{2,}'
    sanitized_filename = re.sub(illegal_chars_pattern, "-", filename)

    return sanitized_filename
