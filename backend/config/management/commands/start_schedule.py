"""start schedules"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django_rq.queues import get_queue

from autot.models import AutotScheduler
from autot.tasks import download_watcher


class Command(BaseCommand):
    """command"""

    def handle(self, *args, **options):
        """handle"""
        self.stdout.write(self.style.SUCCESS("Initiate Schedules"))
        all_schedules = AutotScheduler.objects.all()
        for schedule in all_schedules:
            schedule.create_on_scheduler()
            self.stdout.write(self.style.SUCCESS(f'Created schedule: "{schedule.job}": {schedule.cron_schedule}'))

        queue = get_queue("default")
        queue.enqueue_in(timedelta(seconds=30), download_watcher)
