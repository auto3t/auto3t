"""interact with redis"""

from redis import Redis
from autot.src.config import get_config


class RedisBase:
    """base class, handle connection"""

    CONFIG = get_config()

    def __init__(self):
        self.conn = Redis(
            host=self.CONFIG["REDIS_HOST"],
            port=self.CONFIG["REDIS_PORT"],
        )


class AutotRedis(RedisBase):
    """application interaction"""

    def ping(self):
        """ping redis to test connection"""
        return self.conn.ping()
