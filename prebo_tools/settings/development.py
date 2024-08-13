from prebo_tools.settings.common import *

import os
from dotenv import load_dotenv

load_dotenv(".env.dev")


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = bool(os.environ.get("DEBUG"))
DEBUG = True

CSRF_TRUSTED_ORIGINS = os.environ.get("CSRF_TRUSTED_ORIGINS").split(" ")

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")

# TAILWIND SETTINGS
# https://django-tailwind.readthedocs.io/en/latest/usage.html
INTERNAL_IPS = [
    "127.0.0.1",
]

TAILWIND_APP_NAME = "theme"

NPM_BIN_PATH = os.environ.get("NPM_BIN_PATH")


# EMAIL SETTINGS
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST = os.environ.get("EMAIL_HOST")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")
