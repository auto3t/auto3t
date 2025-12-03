#!/bin/bash
# container entry script

set -e

python manage.py startup_check
python manage.py migrate_and_backup
python manage.py collectstatic --noinput
python manage.py vacuum_sqlite

python manage.py rqworker --with-scheduler default show movie people thumbnails &
python manage.py rqscheduler &
python manage.py clear_schedule
python manage.py start_schedule
python backend_start.py
