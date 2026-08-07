from ninja import Schema
from typing import List, Optional


class Error(Schema):
    message: str


class ConversionCount(Schema):
    count: int


class MarkdownFile(Schema):
    path: str
    url: str
    title: str
    content: str


class ConvertOut(Schema):
    ok: int
    fail: int
    count: int
    files: List[MarkdownFile]


class ConvertIn(Schema):
    url: Optional[str] = None
