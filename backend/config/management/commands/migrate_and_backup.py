"""migrate, create backup before if needed"""

import shutil
import subprocess

from django.conf import settings
from django.core.management import BaseCommand, call_command
from django.utils.timezone import localtime


class Command(BaseCommand):
    """command for run.sh, check for pending migrations, backup if needed"""

    help = "Backs up SQLite DB if migrations are pending, then runs migrate."

    def handle(self, *args, **kwargs):
        """handle command"""

        db_path = settings.DATABASES["default"]["NAME"]

        # Detect pending migrations
        self.stdout.write("Checking for pending migrations...")
        result = subprocess.run(
            ["python", "manage.py", "showmigrations", "--plan"],
            capture_output=True,
            text=True,
            check=True,
        )

        pending = [line for line in result.stdout.splitlines() if "[ ]" in line]

        if pending:
            self.stdout.write(self.style.WARNING("Pending migrations detected."))
            timestamp = localtime().strftime("%Y%m%d_%H%M%S")
            backup_target = db_path.parent / f"{db_path.stem}_backup_{timestamp}{db_path.suffix}"
            self.stdout.write(f"Backing up database to {backup_target}...")
            shutil.copy2(db_path, backup_target)
        else:
            self.stdout.write(self.style.SUCCESS("No pending migrations."))

        call_command("migrate")
