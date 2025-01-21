"""collection of static variables"""

from enum import StrEnum


class TvShowStatus(StrEnum):
    """possible status choices a show can be"""

    r = "Running"
    e = "Ended"
    d = "In Development"
    t = "To Be Determined"

    @classmethod
    def choices(cls):
        return [(i.name, i.value) for i in cls]


class TvEpisodeStatus(StrEnum):
    """possible episode status choices"""

    u = "Upcoming"
    s = "Searching"
    d = "Downloading"
    f = "Finished"
    a = "Archived"
    i = "Ignored"

    @classmethod
    def choices(cls):
        return [(i.name, i.value) for i in cls]
