"""collection of static variables"""

from enum import StrEnum
from typing import TypedDict


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


class MovieStatus(StrEnum):
    """possible movie status choices"""

    u = "Upcoming"
    s = "Searching"
    d = "Downloading"
    f = "Finished"
    a = "Archived"
    i = "Ignored"

    @classmethod
    def choices(cls):
        return [(i.name, i.value) for i in cls]


class MovieProductionState(StrEnum):
    """movie production state choices"""

    r = "Rumored"
    p = "Planned"
    i = "In Production"
    o = "Post Production"
    e = "Released"

    @classmethod
    def choices(cls):
        return [(i.name, i.value) for i in cls]


class TaskItem(TypedDict):
    """describe a task"""

    id: int
    job: str
    name: str
    queue: str


TASK_OPTIONS: list[TaskItem] = [
    TaskItem(id=1, job="tv.tasks.refresh_all_shows", name="Refresh All Shows", queue="default"),
    TaskItem(id=2, job="tv.tasks.refresh_status", name="Refresh Episode Status", queue="show"),
]
