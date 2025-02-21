#!/bin/bash

# Bring up the containers in detached mode with build
docker compose up -d --build

# Collect static files
docker compose exec web python manage.py collectstatic --no-input --clear

# Build Tailwind CSS files
docker compose exec web python manage.py tailwind build
