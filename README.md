![AutoT](assets/autot-banner.jpg?raw=true "AutoT Banner")  

Auto Tape, Track, Torrent

## Dev Setup

### Backend
Install venv in root of repo, e.g.:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

### Frontend

```bash
cd frontend
npm i
```

### Precommit
Apply automatic linting with precommit:

```
pre-commit install
```
