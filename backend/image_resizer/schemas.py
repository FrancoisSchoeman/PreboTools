from ninja import Schema
from typing import Optional


class Error(Schema):
    message: str


class ImageCount(Schema):
    count: int


class ImageResizerIn(Schema):
    width: int
    img_format: str
    custom_name: Optional[str] = ""
