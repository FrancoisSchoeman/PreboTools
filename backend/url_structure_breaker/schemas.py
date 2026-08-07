from ninja import Schema
from typing import List, Optional


class Error(Schema):
    message: str


class ConversionCount(Schema):
    count: int


class StructureRow(Schema):
    url: str
    relative_path: str
    segments: List[str]


class ConvertOut(Schema):
    count: int
    max_depth: int
    rows: List[StructureRow]


class ConvertIn(Schema):
    url: Optional[str] = None
