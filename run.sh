#!/bin/bash
# container entry script

set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

nginx &
python manage.py rqworker --with-scheduler default show movie thumbnails &
python manage.py rqscheduler &
python manage.py start_schedule
uwsgi --ini uwsgi.ini
