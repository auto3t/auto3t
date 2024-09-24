"""interact with redis"""

import redis
from autot.src.config import get_config


class RedisBase:
    """base class, handle connection"""

    CONFIG = get_config()
    NAME_SPACE = CONFIG["REDIS_NAME_SPACE"]

    def __init__(self):
        self.conn = redis.from_url(self.CONFIG["REDIS_CON"], decode_responses=True)


class AutotRedis(RedisBase):
    """application interaction"""

    def ping(self):
        """ping redis to test connection"""
        return self.conn.ping()

    def set_messages(self, messages: dict[str, str], expire: bool | int = False):
        """set messages in bulk"""
        with_name_space = {self.NAME_SPACE + key: value for key, value in messages.items()}
        with self.conn.pipeline() as pipe:
            pipe.mset(with_name_space)
            if expire:
                for key in with_name_space.keys():
                    pipe.expire(key, expire)

            pipe.execute()

    def get_message(self, key: str) -> str | None:
        """get message by key"""
        return self.conn.get(f"{self.NAME_SPACE}{key}")
