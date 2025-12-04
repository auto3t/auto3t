![Auto3T](assets/auto3t-landing-illustration.png?raw=true "Auto3T Banner")

# Auto3T: Tape. Track. Torrent.

- Short: A3T
- Pronounced: *auto-three-tee*
- [Screenshots](SHOWCASE.md)

## Core Functionality

Automatically (mostly) track your favourite TV Shows, Movies, Movie Collections and People across channels, all packed up into one application. 

Based off of metadata provided by:

- [tvmaze.com](https://www.tvmaze.com/): For TV Shows
- [themoviedb.org](https://www.themoviedb.org/): For Movies and Collections

Integrating with:

- [Jellyfin](https://jellyfin.org/): Mediaserver
- [Prowlarr](https://prowlarr.com/): Indexer Manager
- [Transmission](https://transmissionbt.com/): Download Client

By:

- Searching and adding new media releases to your download queue based on timing, aka search after a given release date.
- Filter includes and excludes based on user defined criteria from target bitrate to keyword filtering.

## Free as in Freedom

This application is free and open source, licensed under the GPL-3.0 License, see [LICENSE.md](LICENSE.md) for more details. Free here is as in *freedom* not in *free beer*. To use this application you are required to either:

- Contribute to this project by committing to any of the repos of this organisation at least once per year.
- Or make a small financial contribution to the dev. The price is the equivalent of 3 coffees (or similar) per year of your nearest coffee shop.
- On first start, there is an info box to confirm the above, or click on "remind me later" if you just want to give it a spin first.

This is an honour system, there is no licensing server or paywall. 

- [Github Sponsor](https://github.com/sponsors/bbilly1): This is preferred, and also gives you access to the issues here.
- [Paypal.me](https://paypal.me/bbilly1): For an alternative payment option.

## Installation

You can use the example [docker-compose.yml](https://github.com/auto3t/auto3t/blob/develop/docker-compose.yml) file committed here as a base.

Install and configure the additional services first. For these services, this Readme just gives a quick overview of configurations relevant to this project. For a full documentation, see the corresponding docs of these projects.

### Install Auto3T

This is a docker container, docker is the only supported installation method. This Readme has a quick overview, for more details see [docs.auto3t.com/installation/docker-compose](https://docs.auto3t.com/installation/docker-compose/).

If you are installing this on another platform supporting Docker containers but not Docker Compose, you should be able to infere the required info from the existing installation instructions - or provide your own.

This is the main application, the backend is built with Django, frontend with React TS. Configure at least the required environment variables, make sure you share the volumes as described below.

#### Environment variables

All environment variables are documented in detail in the [installation docs](https://docs.auto3t.com/installation/env-vars/). This is just a broad overview.

| Environment Var       | Value                                 |           |
|-----------------------|---------------------------------------|-----------|
| A3T_PORT              | Container Port, default `8000`        | optional  |
| REDIS_CON             | Redis connection string               | required  |
| TZ                    | Timezone                              | optional  |
| DJANGO_DEBUG          | Additional Debug output               | optional  |
| JF_URL                | Container internal Jellyfin URL       | required  |
| JF_PROXY_URL          | Jellyfin proxy URL                    | optional  |
| JF_API_KEY            | Jellyfin API key                      | required  |
| MOVIE_DB_API_KEY      | [themoviedb.org](https://www.themoviedb.org/settings/api) API key | required  |
| PRR_URL               | Prowlarr URL                          | required  |
| PRR_KEY               | Prowlarr API key                      | required  |
| TM_URL                | Transmission host                     | required  |
| TM_PORT               | Transmission Port                     | required  |
| TM_USER               | Transmission User                     | required  |       
| TM_PASS               | Transmission Password                 | required  |
| TM_BASE_FOLDER        | Transmission completed base folder    | required  |
| TV_BASE_FOLDER        | TV archive folder                     | required  |
| MOVIE_BASE_FOLDER     | Movie archive folder                  | required  |

#### Volumes

- Application data is stored at `/data`.
- The shared volume at `/downloads` needs to be accessible from both Auto3T and Transmission.
- Mount your media archive volume(s) at `/media`.

Also see [> Settings > Archive Options > File Operation Option.](https://docs.auto3t.com/settings/archive-options/#file-operation-option).

#### Networking

Auto3T needs to be able to reach each container over the network. You can do this by publishing each container on localhost or create a separate docker network for inter container communication. Redis only needs to be accessible from Auto3T but you probably want to access the other services over the network too.

### Redis

Redis serves as a cache and handles the queue. Redis only needs to be accessible from the Auto3T container. Redis does not store any persistent data.

### Prowlarr

When configuring your indexer, if the config is available, make sure to select the Magnet option for both "Download link" and "Download link (fallback)".

### Jellyfin

> [!CAUTION]
> Newest supported Jellyfin version is currently 10.10.7. Jellyfin 10.11.x is currently not yet supported due to the tvmaze plugin lacking support. That is tracked [here](https://github.com/jellyfin/jellyfin-plugin-tvmaze/issues/57).

This projects depends on various plugins to be installed and working correctly: 

* [TVmaze](https://github.com/jellyfin/jellyfin-plugin-tvmaze/)
* TMDb
* TMDb Box Sets

Make sure the `/media` folder is shared with the `/media` folder of the Auto3T container.

### Transmission

The files generated by these containers can be accessed read and write from the user you are running the Auto3T container.

Make sure the `/downloads` folder is shared with the `/downloads` of the Auto3T container. It's recommended to configure Transmission to move the finished downloads to a completed folder, e.g. `/downloads/completed`, ideally put the completed folder on the same filesystem as your media, to avoid file operations problems.

## Getting Started

Also see the [docs](https://docs.auto3t.com/getting-started/) for more details.

### Create user

Create your user by running:

```bash
python manage.py createsuperuser
```

in the Auto3T docker container. Follow the prompts from there to create your credentials.

### Setup Auto3T

On the settings page:

- Configure your keywords you want to search for
- Configure your release target
- Configure your schedules

Then add your Shows, Movies, Collection and People you want to track. Sit back, and let Auto3T do its thing until your media appears in your Jellyfin like magic.
