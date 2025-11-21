"""file archive functions"""

import os
import shutil
from pathlib import Path


def _ensure_parent(target_file: Path):
    """create parent folders for the target file."""
    target_file.parent.mkdir(parents=True, exist_ok=True)


def move(src_file: Path, target_file: Path):
    """mv src to target"""
    _ensure_parent(target_file)
    shutil.move(src_file, target_file, copy_function=shutil.copyfile)


def copy(src_file: Path, target_file: Path):
    """cp src to target"""
    _ensure_parent(target_file)
    shutil.copy2(src_file, target_file)


def copy_and_delete(src_file: Path, target_file: Path):
    """cp src to target, delete src for filesystem without mv"""
    _ensure_parent(target_file)
    shutil.copy2(src_file, target_file)
    src_file.unlink()


def hard_link(src_file: Path, target_file: Path):
    """hardlink src to target, only works on supported and same filesystem"""
    _ensure_parent(target_file)
    if target_file.exists():
        target_file.unlink()

    os.link(src_file, target_file)


def copy_and_hardlink(src_file: Path, target_file: Path):
    """cp src to target, hardlink target back to src"""
    _ensure_parent(target_file)
    shutil.copy2(src_file, target_file)

    if src_file.exists():
        src_file.unlink()

    os.link(target_file, src_file)
