from ninja.security import APIKeyHeader
import os
from dotenv import load_dotenv

load_dotenv()


class ApiKey(APIKeyHeader):
    param_name = "X-API-Key"

    def authenticate(self, request, key):
        if key == os.environ.get("INTERNAL_API_KEY"):
            return key


header_key = ApiKey()
