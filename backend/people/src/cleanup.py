"""clean up people"""

from people.models import Person


def cleanup_people():
    """delete people without credits and not locked"""
    for person in Person.objects.all():
        if person.is_to_delete():
            person.delete()
