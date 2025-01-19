FROM python:3.11.3-slim-bullseye AS python-builder

# install requirements
RUN python -m venv /applib
ENV PATH="/applib/bin:$PATH"
COPY ./requirements.txt /requirements.txt
RUN pip install -r requirements.txt

# build main.js
FROM node:22.10 AS js-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# build final image
FROM python:3.11.3-slim-bullseye AS autot
ARG INSTALL_DEBUG
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /data/static /downloads /media/tv

RUN apt-get clean && apt-get -y update && apt-get -y install --no-install-recommends \
    nginx \
    curl && rm -rf /var/lib/apt/lists/*

# install debug tools for testing environment
RUN if [ "$INSTALL_DEBUG" ] ; then \
    apt-get -y update && apt-get -y install --no-install-recommends \
    vim htop bmon net-tools iputils-ping procps curl \
    && pip install ipython \
    ; fi

RUN for dir in uwsgi body proxy fastcgi scgi; do \
        mkdir -p /var/lib/nginx/$dir && \
        chown www-data:www-data /var/lib/nginx/$dir; \
    done

COPY nginx.conf /etc/nginx/nginx.conf

# copy build requirements
COPY --from=python-builder /applib /applib
ENV PATH=/applib/bin:$PATH

# copy application into container
COPY ./backend /app

# copy compiled js
COPY --from=js-builder /app/frontend/build/ /app/static/
RUN chmod 777 -R /app/static /var/log/nginx/

COPY ./run.sh /app
COPY ./backend_start.py /app

WORKDIR /app
EXPOSE 8000

CMD ["./run.sh"]
