# Contribute to Auto3T

Thank you for considering contributing to Auto3T.

## How to open an Issue

## Dev Setup

This project is set up to be developed outside of a docker container. When testing your changes, make sure everything works fine inside the container as well, there can be subtle differences, especially if it comes to networking and filesystem access.

### Backend
Install your dependencies in the root of repo, e.g. with pip and venv:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

Environment variables can be loaded from a `.env` file. For a minimal example, place this file it the same folder as `manage.py`: 

```
REDIS_CON=redis://localhost:6379
JF_URL=http://localhost:8096
JF_API_KEY=xxxxx
PRR_URL=http://localhost:9696
PRR_KEY=yyyyy
MOVIE_DB_API_KEY=zzzzz
TM_URL=localhost
TM_PORT=9091
TM_USER=transmission
TM_PASS=transmission
TM_BASE_FOLDER=../volume/downloads/complete
TV_BASE_FOLDER=../volume/media/tv
MOVIE_BASE_FOLDER=../volume/media/movie
TZ=America/New_York
DJANGO_DEBUG=True
```

### Frontend

The frontend dependencies are expected to be installed from the `frontend` folder. E.g.:

```bash
cd frontend
npm i
```

Configure the API endpoints by creating a `.env.development` file next to the package.json file, e.g.:

```
VITE_APP_API_URL=http://localhost:8000
```

### Precommit

Apply automatic linting with precommit:

```bash
pre-commit install
```

Now all your future commits will automatically be linted and formatted as expected.

### Run

1. Start the required docker containers, configure as needed.
2. Run the startup checks and migrations, for reference see `run.sh`.
3. Start the django backend API dev server: `python manage.py runserver`.
4. Start the redis queue worker `rqworker` and scheduler `rqscheduler`, see `run.sh` for the exact commands.
5. Run the react frontend with `npm start` from the frontend folder.

There is a convenient `devstart.sh` script in the root of this repo that launches a tmux session and each thread in a separate window.
