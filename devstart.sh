#!/bin/bash

open_and_execute() {
    local command="$1"
    kitty -- bash -c "$command" &
}

commands=(
    "docker compose -f docker-compose_dev.yml up"
    "source .venv/bin/activate && cd backend && python manage.py runserver"
    "source .venv/bin/activate && cd backend && python manage.py shell"
    "source .venv/bin/activate && cd backend && sleep 3 && python manage.py rqworker --with-scheduler default show thumbnails"
    "cd frontend && npm start"
)

for cmd in "${commands[@]}"; do
    open_and_execute "$cmd"
done

bspc node -k
