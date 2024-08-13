import os
from dotenv import load_dotenv

load_dotenv(".env.dev")

DJANGO_ENV = os.environ.get("DJANGO_ENV")
OPENAI_SECRET = os.environ.get("OPENAI_SECRET")
