# AUTOT
Auto Tape, Track, Torrent

## Backend Endpoints
| App     | Endpoint                        | Detail |
|---------|---------------------------------|--------|
| autot   | `/api/keyword/`                 | keyword list |
| autot   | `/api/keyword/<id>/`            | keyword detail |
| autot   | `/api/keyword-category/`        | keyword category list |
| autot   | `/api/keyword-category/<id>/`   | Keyword Category detail |
| autot   | `/api/torrent/`                 | torrent list |
| autot   | `/api/torrent/<id>/`            | torrent detail |
| autot   | `/api/torrent/search/`          | torrent free search |
| tv      | `/api/tv/show/`                 | show list |
| tv      | `/api/tv/show/<id>/`            | show detail |
| tv      | `/api/tv/season/`               | season list |
| tv      | `/api/tv/season/<id>/`          | season detail |
| tv      | `/api/tv/season/<id>/next/`     | next episode |
| tv      | `/api/tv/season/<id>/previous/` | previous episode |
| tv      | `/api/tv/season/<id>/torrent/`  | episode torrent |
| tv      | `/api/tv/episode/`              | episode list |
| tv      | `/api/tv/episode/<id>/`         | episode detail |
| tv      | `/api/tv/remote-search/`        | search remote |
| auth    | `/auth/token/`                  | login token |
| auth    | `/auth/token/refresh/`          | refresh token |
| artwork | `/artwork/<foler>/<hash>.jpg`   | artwork item |
