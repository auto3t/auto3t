"""artwork model"""

import base64
import logging
import os
from hashlib import md5
from io import BytesIO

import requests
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from PIL import Image, ImageFilter

logger = logging.getLogger("django")


class Artwork(models.Model):
    """represents an artwork instance"""

    RELATED_CROP: dict[str, tuple[int, int]] = {
        "image_collection": (1000, 1500),
        "image_movie": (1000, 1500),
        "image_show": (1000, 1500),
        "episode_fallback": (1280, 720),
        "season_fallback": (1000, 1500),
        "image_season": (1000, 1500),
        "image_episode": (1280, 720),
        "image_person": (1000, 1500),
    }

    image_url = models.URLField(unique=True)
    image = models.ImageField(upload_to="artwork/", null=True, blank=True)
    image_blur = models.TextField(null=True, blank=True)

    def __str__(self) -> str:
        return self.image_url

    def get_related(self) -> str | None:
        """get related"""
        for related in self.RELATED_CROP:
            if (getattr(self, related)).exists():
                return related

        return None

    def get_crop(self) -> tuple[int, int] | None:
        """get crop defined on model"""
        related = self.get_related()
        if not related:
            return None

        return self.RELATED_CROP.get(related)

    def update(self, image_url: str) -> None:
        """update and replace"""
        self.image.delete(save=False)  # pylint: disable=no-member
        self.image_blur = None
        self.image_url = image_url
        self.save()

    def download(self) -> None:
        """download and index"""
        logger.info("download artwork: %s", self.image_url)
        self._download_image()
        if self.image:
            self._get_image_blur()

    def _download_image(self) -> None:
        """download from url"""
        try:
            response = requests.get(self.image_url, timeout=60)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                cropped_image = self.crop_to_aspect(img)

                img_io = BytesIO()
                cropped_image.save(img_io, format="JPEG")

                img_content = ContentFile(img_io.getvalue(), self.file_path)
                self.image.save(self.file_path, img_content)  # pylint: disable=no-member

        except Exception as err:  # pylint: disable=broad-exception-caught
            logger.error("Failed to download image: %s, %s", self.image_url, str(err))

    def crop_to_aspect(self, img):
        """crop image to aspect ratio"""
        img_width, img_height = img.size
        is_aspect_ratio = img_width / img_height

        target = self.get_crop()
        if not target:
            return img

        target_aspect_ratio = target[0] / target[1]

        if is_aspect_ratio > target_aspect_ratio:  # Image is too wide
            new_width = int(target_aspect_ratio * img_height)
            new_height = img_height
        else:  # Image is too tall
            new_width = img_width
            new_height = int(img_width / target_aspect_ratio)

        left = (img_width - new_width) / 2
        top = (img_height - new_height) / 2
        right = (img_width + new_width) / 2
        bottom = (img_height + new_height) / 2

        cropped_image = img.crop((left, top, right, bottom))
        cropped_image.thumbnail(target)
        return cropped_image

    def _get_image_blur(self) -> None:
        """create image blur"""
        with Image.open(self.image) as image:
            blurred_image = image.filter(ImageFilter.GaussianBlur(100))
            blurred_image.thumbnail((50, 50))

        buffer = BytesIO()
        blurred_image.save(buffer, format="JPEG", quality=60, optimize=True)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        self.image_blur = f"data:image/jpg;base64,{img_base64}"
        self.save()

    @property
    def id_hash(self) -> str:
        """hash of url"""
        return md5(self.image_url.encode()).hexdigest()  # pylint: disable=no-member

    @property
    def file_path(self) -> str:
        """build file path"""
        folder = self.id_hash[-1].lower()
        img_path = f"{folder}/{self.id_hash}.jpg"

        return img_path


@receiver(post_delete, sender=Artwork)
def delete_image_file(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """delete from filesystem"""
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
