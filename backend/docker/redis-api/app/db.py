"""

This module handles database connections and configurations.
It uses the redis library to connect to a Redis database.
It also loads environment variables using the dotenv library.

"""

import redis
import os
from dotenv import load_dotenv

load_dotenv()

database_info = {
    'host': os.getenv('REDIS_HOST'),
    'port': int(os.getenv('REDIS_PORT')),
    'user': os.getenv('REDIS_USER'),
    'password': os.getenv('REDIS_PASSWORD'),
}

# Class to handle Redis connection, singleton pattern
class Database:
    _instance = None
    _connection = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def get_connection(self):
        if not self._connection:
            self._connection = redis.Redis(
                host=database_info['host'],
                port=database_info['port'],
                db=0,
                decode_responses=True,
                password=database_info['password']
            )
        return self._connection
    
    