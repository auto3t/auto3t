"""start schedules"""

from django.core.management.base import BaseCommand
from django_rq import get_scheduler

from autot.models import AutotScheduler


class Command(BaseCommand):
    """command"""

    def handle(self, *args, **options):
        """handle"""
        self.stdout.write(self.style.SUCCESS('Initiate Schedules'))
        scheduler = get_scheduler("default")
        all_schedules = AutotScheduler.objects.all()

        for schedule in all_schedules:
            schedule.create_on_scheduler(scheduler)
            schedule.save()
            self.stdout.write(self.style.SUCCESS(f'Created schedule: "{schedule.job}"'))
