"""people tasks"""

from django.utils.timezone import localtime
from django_rq import job
from people.models import Person
from people.src.movie_person import MovieDBPerson
from people.src.tv_person import TVPerson


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
