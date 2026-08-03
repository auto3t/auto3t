"""clean up people"""

import logging

from people.models import Credit, Person

logger = logging.getLogger("django")


def cleanup_people():
    """delete people without credits and not locked"""

    unused_credits = Credit.objects.filter(tvshow__isnull=True, movie__isnull=True)
    logger.info("cleaning %s unused Credit row(s)", len(unused_credits))
    unused_credits.delete()

    unused_people = Person.objects.filter(is_locked=False, credit__isnull=True)
    logger.info("cleaning %s unused Person row(s)", len(unused_people))
    unused_people.delete()
