"""download archive from remote"""

import gzip
from time import perf_counter

import requests
from imdb_cache.models import IMDBRatings, IMDBSynced


class FetchIMDBData:
    """fetch imdb data"""

    RATINGS_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz"

    def fetch_ratings(self):
        """handle ratings fetch"""

        start = perf_counter()
        content_len = self.download_ratings()
        end = perf_counter()
        duration_sec = int(end - start)
        IMDBSynced.objects.create(file_size=content_len, duration_sec=duration_sec, archive_type="r")

    def download_ratings(self) -> int:
        """download ratings archive"""

        response = requests.get(self.RATINGS_URL, stream=True, timeout=300)
        response.raise_for_status()

        with gzip.GzipFile(fileobj=response.raw) as gz:
            text = gz.read().decode("utf-8")

        results = text.split("\n")[1:]
        to_index = []
        for result in results:
            if not result:
                continue

            tconst, average_rating, num_votes = result.split("\t")
            if not average_rating:
                continue

            to_index.append(
                IMDBRatings(
                    tconst=tconst,
                    averageRating=float(average_rating),
                    numVotes=int(num_votes),
                )
            )

        IMDBRatings.objects.bulk_create(
            to_index,
            update_conflicts=True,
            update_fields=["averageRating", "numVotes"],
            unique_fields=["tconst"],
        )

        content_len = int(response.headers["Content-Length"])
        return content_len
