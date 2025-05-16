"""start schedules"""

from django.core.management.base import BaseCommand

from autot.models import AutotScheduler


class Command(BaseCommand):
    """command"""

    def handle(self, *args, **options):
        """handle"""
        self.stdout.write(self.style.SUCCESS("Initiate Schedules"))
        all_schedules = AutotScheduler.objects.all()
        for schedule in all_schedules:
            schedule.create_on_scheduler()
            self.stdout.write(self.style.SUCCESS(f'Created schedule: "{schedule.job}": {schedule.cron_schedule}'))
