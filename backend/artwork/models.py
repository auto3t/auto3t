"""artwork model"""

import base64
import os
from hashlib import md5
from io import BytesIO

import requests

from django.core.files.base import ContentFile
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from PIL import Image, ImageFilter


class Artwork(models.Model):
    """represents an artwork instance"""

    image_url = models.URLField(unique=True)
    image = models.ImageField(upload_to="artwork/", null=True, blank=True)
    image_blur = models.TextField(null=True, blank=True)

    def update(self, image_url: str) -> None:
        """update and replace"""
        if image_url == self.image_url:
            return

        self.image.delete(save=False)  # pylint: disable=no-member
        self.image_blur = None
        self.image_url = image_url
        self.save()

    def download(self) -> None:
        """download and index"""
        self._download_image()
        self._get_image_blur()

    def _download_image(self) -> None:
        """download from url"""
        try:
            response = requests.get(self.image_url, timeout=30)
            if response.status_code == 200:
                folder = self.id_hash[-1].lower()
                self.image.save(f"{folder}/{self.id_hash}.jpg", ContentFile(response.content), save=True)  # pylint: disable=no-member

        except Exception:  # pylint: disable=broad-exception-caught
            print(f"Failed to download image: {self.image_url}")

    def _get_image_blur(self) -> None:
        """create image blur"""
        with Image.open(self.image) as image:
            blurred_image = image.filter(ImageFilter.GaussianBlur(10))
            blurred_image.thumbnail((100, 100))

        buffer = BytesIO()
        blurred_image.save(buffer, format="JPEG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        self.image_blur = f"data:image/jpg;base64,{img_base64}"
        self.save()

    @property
    def id_hash(self) -> str:
        """hash of remote_server_id"""
        return md5(self.image_url.encode()).hexdigest()  # pylint: disable=no-member


@receiver(post_delete, sender=Artwork)
def delete_image_file(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete from filesystem"""
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
