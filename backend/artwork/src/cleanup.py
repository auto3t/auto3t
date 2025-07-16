"""handle artwork cleanup, called from task"""

from pathlib import Path

from artwork.models import Artwork


def cleanup_art():
    """cleanup unlinked art"""
    for artwork in Artwork.objects.all():
        if not artwork.get_related():
            artwork.delete()
            continue

        if artwork.image:
            if not Path(artwork.image.path).exists():
                artwork.image.delete()
                artwork.save()
