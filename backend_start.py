"""start backend python application, read env var"""

from os import environ

import uvicorn

LOG_LEVEL = "info" if environ.get("DJANGO_DEBUG") else "error"

if __name__ == "__main__":
    uvicorn.run(
        "config.asgi:application",
        host="0.0.0.0",
        port=int(environ.get("A3T_PORT", 8000)),
        workers=4,
        log_level=LOG_LEVEL,
        reload=False,
    )
