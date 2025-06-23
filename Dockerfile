FROM python:3.11.13-slim-bullseye AS python-builder

# install requirements
RUN python -m venv /applib
ENV PATH="/applib/bin:$PATH"
COPY ./requirements.txt /requirements.txt
RUN pip install -r requirements.txt

# build main.js
FROM node:24 AS js-builder

ARG GIT_COMMIT
ENV VITE_GIT_COMMIT=$GIT_COMMIT

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# build final image
FROM python:3.11.13-slim-bullseye AS autot
ARG INSTALL_DEBUG
ENV PYTHONUNBUFFERED=1
ENV PATH=/applib/bin:$PATH

RUN mkdir -p /data/static /downloads /media/tv

RUN apt-get clean && apt-get -y update && apt-get -y install --no-install-recommends \
    curl && rm -rf /var/lib/apt/lists/*

# copy build requirements
COPY --from=python-builder /applib /applib

# install debug tools for testing environment
RUN if [ "$INSTALL_DEBUG" ] ; then \
    apt-get -y update && apt-get -y install --no-install-recommends \
    vim htop bmon net-tools iputils-ping procps curl lsof \
    && /applib/bin/python -m pip install ipython \
    ; fi

# copy application into container
COPY ./backend /app

# copy compiled js
COPY --from=js-builder /app/frontend/build/ /app/static/
COPY --from=js-builder /app/frontend/build/index.html /app/templates/index.html

COPY ./run.sh /app
COPY ./backend_start.py /app

WORKDIR /app
EXPOSE 8000

CMD ["./run.sh"]
