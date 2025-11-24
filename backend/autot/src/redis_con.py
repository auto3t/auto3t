"""interact with redis"""

import json
from typing import TYPE_CHECKING

import redis

from autot.src.config import get_config

if TYPE_CHECKING:
    from autot.src.media_server import MediaServerItem


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

    def set_hash_messages(
        self, key: str, values: dict[str, "MediaServerItem"], expire: bool | int = False, delete: bool = False
    ):
        """set pipeline"""
        redis_key = f"{self.NAME_SPACE}{key}"
        if delete:
            self.conn.delete(redis_key)

        with self.conn.pipeline() as pipe:
            for hash_key, hash_value in values.items():
                pipe.hset(redis_key, hash_key, json.dumps(hash_value))

            if expire:
                pipe.expire(redis_key, expire)

            pipe.execute()

    def get_hash_message_key(self, key: str, hash_key: str) -> dict | None:
        """get hash key if available"""
        response = self.conn.hget(f"{self.NAME_SPACE}{key}", hash_key)
        if not response:
            return None

        return json.loads(response)

    def get_hash_message(self, key: str) -> dict | None:
        """get complete hash message"""
        return self.conn.hgetall(f"{self.NAME_SPACE}{key}")
