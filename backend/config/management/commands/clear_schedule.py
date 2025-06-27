"""clear scheduled tasks"""

from django.conf import settings
from django.core.management.base import BaseCommand
from django_rq.queues import get_queue


class Command(BaseCommand):
    """command"""

    def handle(self, *args, **options):
        """handle command"""
        self.stdout.write(self.style.SUCCESS("Clear schedule"))
        queue_names = settings.RQ_QUEUES.keys()

        for queue_name in queue_names:
            queue = get_queue(queue_name)
            all_job_ids = queue.scheduled_job_registry.get_job_ids()

            for job_id in all_job_ids:
                queue.fetch_job(job_id=job_id).delete()
