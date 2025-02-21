from ninja import Schema
from typing import List


class KeywordAnalyserInSchema(Schema):
    location: str
    locale: str
    url: str
    keywords: List[str]


class KeywordAnalyserOutSchema(Schema):
    url: str
    mapped_keyword: str
    meta_title: str
    meta_description: str
    new_title: str
    new_description: str
    insights: str


class KeywordAnalyserResultsSchema(Schema):
    results: KeywordAnalyserOutSchema


class Error(Schema):
    message: str
