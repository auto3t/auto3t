"""cache db router"""

from autot.src.config import get_config

AUTOT_CONFIG = get_config()


class CachedDataRouter:
    """conditional router"""

    route_app_labels = {"imdb_cache"}

    def _enabled(self):
        return AUTOT_CONFIG.get("INTEGRATE_IMDB")

    def db_for_read(self, model, **hints):
        """handle conditional"""
        if self._enabled() and model._meta.app_label in self.route_app_labels:
            return "cached"
        return None

    def db_for_write(self, model, **hints):
        """handle conditional"""
        if self._enabled() and model._meta.app_label in self.route_app_labels:
            return "cached"
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """handle conditional"""
        if not self._enabled():
            return None
        if obj1._meta.app_label in self.route_app_labels or obj2._meta.app_label in self.route_app_labels:
            return False
        return None

    def allow_migrate(self, db, app_label, **hints):
        """handle conditional"""
        if not self._enabled():
            # When disabled, do not migrate cached_data anywhere
            return app_label not in self.route_app_labels

        if app_label in self.route_app_labels:
            return db == "cached"

        return db == "default"
