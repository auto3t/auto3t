#!/bin/bash
# container entry script

set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

nginx &
python manage.py rqworker --with-scheduler default show thumbnails &
uwsgi --ini uwsgi.ini
