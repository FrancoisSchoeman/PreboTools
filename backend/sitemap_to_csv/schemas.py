from ninja import Schema
from typing import List, Optional


class Error(Schema):
    message: str


class ConversionCount(Schema):
    count: int


class SitemapRow(Schema):
    loc: str
    lastmod: str = ""
    changefreq: str = ""
    priority: str = ""


class ConvertOut(Schema):
    count: int
    rows: List[SitemapRow]


class ConvertIn(Schema):
    url: Optional[str] = None
