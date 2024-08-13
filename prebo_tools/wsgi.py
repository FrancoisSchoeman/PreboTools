"""
WSGI config for prebo_tools project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

from .settings.secrets import DJANGO_ENV

# Set the DJANGO_SETTINGS_MODULE based on the environment
if DJANGO_ENV == "production":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "prebo_tools.settings.production")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "prebo_tools.settings.development")

application = get_wsgi_application()
