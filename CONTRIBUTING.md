# Contribute to Auto3T

Thank you for considering contributing to Auto3T.

## How to open an Issue

Please read this carefully. You are agreeing to this when opening any issues in the [Auto3T](https://github.com/auto3t) organization. This file might have [changed](https://github.com/auto3t/auto3t/commits/develop/CONTRIBUTING.md) since your last visit.

The maintainer(s) and regular [contributors](https://github.com/auto3t/auto3t/graphs/contributors) to this project are likely going to fix the bugs they encounter themselves, improve functionality that needs improvement in their own view add will add new features they like to use.

If you are a new here and would like to contribute:

- Welcome!
- If you are not sure, use the [I want to contribute](https://github.com/auto3t/auto3t/issues/new?template=CONTRIBUTE.yml) issue template to describe what you want to do.
- Fixing bugs you are encountering is the best way to get started.
- Another good way is to improve the docs.
- Extending functionality is OK, as long as the existing maintainer(s) and contributors like to use the functionality you want to add or the functionality is simple enough to maintain. When in doubt, reach out first.
- Adding additional options for indexer, download client and mediaserver is likely not realistic unless you show that you are a long term committed contributor and will maintain these integrations for the duration of this project.

For bug reports:
- That is treated like support and is reserved to contributors and sponsors. Also see [free as in freedom](https://github.com/auto3t/auto3t?tab=readme-ov-file#free-as-in-freedom).
- Contributors and maintainers are likely fixing the bugs they encounter themselves.

## Future plans

A collection of topics that are likely, unlikely or very unlikely going to happen.

### Likely

- More discovery options, like "streaming now", "premiering soon", or similar.
- Import and show imdb ratings
- API documentation and access

### Unlikely

- Additional integrations

### Very unlikely

- Installation options other than docker

## Contribute to the Docs

Another valuable contribution is helping improve the docs. The docs available at [docs.auto3t.com](https://docs.auto3t.com/) are built from [auto3t/docs](https://github.com/auto3t/docs), you can find additional instructions there.

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
