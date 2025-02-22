from ninja import Schema
from typing import List
from datetime import datetime


class KeywordAnalyserInSchema(Schema):
    location: str
    locale: str
    url: str
    keywords: List[str]


class KeywordAnalyserOutSchema(Schema):
    id: int
    url: str
    mapped_keyword: str
    meta_title: str
    meta_description: str
    new_title: str
    new_description: str
    user_intent_analysis: List[str]
    competitive_insights: List[str]
    seo_content_recommendations: List[str]
    content_and_blog_ideas: List[str]
    faq_creation_and_enhancements: List[str]
    date_created: datetime
    date_modified: datetime


class KeywordAnalyserResultsSchema(Schema):
    results: KeywordAnalyserOutSchema


class Error(Schema):
    message: str
