import os
from dotenv import load_dotenv

# load_dotenv(".env.dev")
load_dotenv(".env.prod")

DJANGO_ENV = os.environ.get("DJANGO_ENV")
OPENAI_SECRET = os.environ.get("OPENAI_SECRET")
