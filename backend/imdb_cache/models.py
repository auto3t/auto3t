"""index cached imdb data"""

from django.db import models


class IMDBSynced(models.Model):
    """sync history"""

    ARCHIVE_TYPE_CHOICES = [
        ("r", "rating"),
    ]

    date_synced = models.DateTimeField(auto_now_add=True)
    file_size = models.IntegerField()
    duration_sec = models.IntegerField()
    archive_type = models.CharField(choices=ARCHIVE_TYPE_CHOICES, max_length=1)


class IMDBRatings(models.Model):
    """store ratings"""

    tconst = models.CharField(primary_key=True)
    averageRating = models.FloatField()
    numVotes = models.IntegerField()

    def __str__(self):
        return f"{self.tconst}: {self.averageRating} ({self.numVotes})"
