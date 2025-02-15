from ninja import Schema
from ninja.files import UploadedFile
from datetime import datetime
from typing import List


class Error(Schema):
    message: str


class FeedSchema(Schema):
    id: int
    name: str
    url: str | None
    feed_type: str
    file_format: str
    date_created: datetime
    date_modified: datetime


class SingleFeedResultSchema(Schema):
    product_id: str
    title: str
    description: str
    link: str
    image_link: str
    availability: str
    price: str
    color: str
    product_type: str
    brand: str
    identifier_exists: str
    material: str
    condition: str
    size: str
    custom_attributes: dict | None


class FeedResultsSchema(Schema):
    feed: FeedSchema
    products: List[SingleFeedResultSchema] = []


class FeedImportSchema(Schema):
    name: str
    url: str
    feed_type: str
    file_format: str


class FeedUploadSchema(Schema):
    name: str
    # TODO: Change to False
    limited_products_import: bool = True
