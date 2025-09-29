#!/bin/bash

SESSION_NAME="autot"

wait_for_redis() {
    echo "Waiting for Redis container to start..."
    while [ "$(docker inspect -f '{{.State.Running}}' autot-redis)" != "true" ]; do
        echo "Redis not running yet, checking again in 5 seconds..."
        sleep 5
    done
    echo "Redis is running!"
}

cleanup() {
    echo "Cleaning up..."
    docker compose down
    echo "Containers stopped and removed!"
}

trap cleanup EXIT

tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? != 0 ]; then

    # compose
    tmux new-session -d -s $SESSION_NAME -n "dev"
    tmux send-keys -t $SESSION_NAME:"dev" "docker compose pull && docker compose up -d autot-redis autot-prowlarr autot-jellyfin autot-transmission && docker compose logs -f" C-m
    wait_for_redis

    # django
    tmux split-window -t $SESSION_NAME -h
    tmux send-keys -t $SESSION_NAME:"dev.1" "source .venv/bin/activate && cd backend && python manage.py runserver" C-m

    # worker
    tmux split-window -v -t $SESSION_NAME:"dev.0" -l 66%
    tmux send-keys -t $SESSION_NAME:"dev.1" "source .venv/bin/activate && cd backend && python manage.py rqworker --with-scheduler default show movie thumbnails" C-m

    # scheduler
    tmux split-window -v -t $SESSION_NAME:"dev.1" -l 50%
    tmux send-keys -t $SESSION_NAME:"dev.2" "source .venv/bin/activate && cd backend && python manage.py rqscheduler" C-m

    # react
    tmux split-window -v -t $SESSION_NAME:"dev.3" -l 66%
    tmux send-keys -t $SESSION_NAME:"dev.4" "cd frontend && npm start" C-m

    # shell
    tmux split-window -v -t $SESSION_NAME:"dev.4" -l 50%
    tmux send-keys -t $SESSION_NAME:"dev.5" "source .venv/bin/activate && cd backend && python manage.py shell" C-m

fi

tmux attach-session -t $SESSION_NAME
