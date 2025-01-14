"""run vacuum on sqlite db"""

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    """command"""

    def handle(self, *args, **options):
        """handle"""
        self.stdout.write(self.style.SUCCESS("Vacuum sqlite DB"))
        before = settings.DATABASES["default"]["NAME"].stat().st_size

        cursor = connection.cursor()
        cursor.execute("VACUUM")
        connection.close()

        after = settings.DATABASES["default"]["NAME"].stat().st_size
        diff = (before - after) // 1024
        self.stdout.write(self.style.SUCCESS(f"Vacuum completed: Reclaimed {diff} KB"))
