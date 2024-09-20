#!/bin/bash

# Bring up the containers in detached mode with build
sudo docker compose -f docker-compose.prod.yml up -d --build

# Collect static files
sudo docker compose -f docker-compose.prod.yml exec web python manage.py collectstatic --no-input --clear

# Build Tailwind CSS files
sudo docker compose -f docker-compose.prod.yml exec web python manage.py tailwind build
