"""people tasks"""

from datetime import timedelta

from django.db.models import Q
from django.utils.timezone import localtime
from django_rq import job
from people.models import Person
from people.src.movie_person import MovieDBPerson
from people.src.tv_person import TVPerson

from autot.tasks import download_thumbnails


@job
def refresh_people(outdated: int = 30) -> None:
    """refresh people outdated"""
    always_refresh = Person.objects.filter(Q(last_refresh__isnull=True) | Q(tracking_movie=True) | Q(tracking_tv=True))

    daily = Person.objects.count() // outdated
    outdated_persons = Person.objects.filter(Q(last_refresh__gte=localtime() + timedelta(days=outdated)))[:daily]

    to_refresh = {i[0] for i in always_refresh.values_list("id")}
    if outdated_persons:
        to_refresh = to_refresh | {i[0] for i in outdated_persons.values_list("id")}

    person_tasks: list = []
    for person_id in to_refresh:
        person_task = refresh_single_person.delay(person_id=person_id)
        person_tasks.append(person_task)

    download_thumbnails.delay(depends_on=person_tasks)  # type: ignore


@job("people")
def refresh_single_person(person_id: int) -> None:
    """refresh single person"""
    try:
        person = Person.objects.get(id=person_id)
    except Person.DoesNotExist:
        return

    if person.tvmaze_id:
        TVPerson(tvmaze_person_id=person.tvmaze_id).refresh()

    if person.the_moviedb_id:
        MovieDBPerson(moviedb_person_id=person.the_moviedb_id).refresh()

    person.last_refresh = localtime()
    person.save(update_fields=["last_refresh"])
    person.check_tracking_movies()
    person.check_tracking_shows()
