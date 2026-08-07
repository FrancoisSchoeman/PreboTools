from ninja import Schema
from typing import List, Optional


class Error(Schema):
    message: str


class ConversionCount(Schema):
    count: int


class ProductRow(Schema):
    id: str = ""
    title: str = ""
    description: str = ""
    google_product_category: str = ""
    product_type: str = ""
    link: str = ""
    image_link: str = ""
    additional_image_links: str = ""
    original_image_url: str = ""
    condition: str = ""
    availability: str = ""
    price_value: str = ""
    price_currency: str = ""
    brand: str = ""
    identifier_exists: str = ""
    color: str = ""
    size: str = ""
    tax_country: str = ""
    tax_rate: str = ""
    tax_ship: str = ""
    shipping_1_country: str = ""
    shipping_1_service: str = ""
    shipping_1_price: str = ""
    shipping_2_country: str = ""
    shipping_2_service: str = ""
    shipping_2_price: str = ""
    shipping_3_country: str = ""
    shipping_3_service: str = ""
    shipping_3_price: str = ""


class ConvertOut(Schema):
    count: int
    rows: List[ProductRow]


class ConvertIn(Schema):
    url: Optional[str] = None
