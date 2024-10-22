#!/bin/bash
# container entry script
# set IS_MAIN: Run only server
# set IS_WORKER: Run only worker
# else run worker and server

set -e

run_initial_setup() {
    echo "Running migrations..."
    python manage.py migrate --noinput
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
}

start_worker() {
    echo "Starting RQ worker..."
    python manage.py rqworker --with-scheduler default show thumbnails
}

start_server() {
    echo "Starting Django server..."
    nginx &
    uwsgi --ini uwsgi.ini
}


run_initial_setup
start_worker &
start_server
