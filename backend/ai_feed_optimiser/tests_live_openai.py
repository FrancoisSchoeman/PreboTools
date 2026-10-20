import os

import pytest
from dotenv import load_dotenv

load_dotenv()

pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_SECRET"),
    reason="OPENAI_SECRET not set; skipping live OpenAI tests",
)

REQUIRED_PRODUCT_KEYS = {
    "product_id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "color",
    "product_type",
    "brand",
    "identifier_exists",
    "material",
    "condition",
    "size",
}

SAMPLE_PRODUCT = {
    "ID": 202204370148,
    "TITLE": "dd Chair Wire w/Cushion 78x69x74.5cm",
    "LINK": "https://storeandmore.co.za/product/dd-chair-wire-w-cushion-78x69x74-5cm/?utm_source=Google Shopping&utm_campaign=Google Feed&utm_medium=cpc&utm_term=202204370148",
    "IMAGE_LINK": "https://storeandmore.co.za/wp-content/uploads/2024/05/401-4-00035.jpg",
    "AVAILABILITY": "out_of_stock",
    "PRICE": "ZAR 799.00",
    "PRODUCT_TYPE": "Pets &amp; Outdoor||Outdoor||Outdoor Furniture",
    "CONDITION": "New",
    "IDENTIFIER_EXISTS": "no",
    "DESCRIPTION": "",
}


def test_optimize_product_returns_expected_schema():
    from ai_feed_optimiser.utils.openai_integration import optimize_product

    result = optimize_product(SAMPLE_PRODUCT)

    assert isinstance(result, dict)
    assert REQUIRED_PRODUCT_KEYS.issubset(result.keys())
    assert isinstance(result["title"], str) and result["title"].strip()
    assert len(result["title"]) <= 150
    assert isinstance(result["description"], str)
    assert result["link"] == SAMPLE_PRODUCT["LINK"]
    assert result["price"] == SAMPLE_PRODUCT["PRICE"]
    assert result["availability"] == SAMPLE_PRODUCT["AVAILABILITY"]
    assert str(result["product_id"]) == str(SAMPLE_PRODUCT["ID"])

    custom_attributes = result.get("custom_attributes")
    assert custom_attributes is None or isinstance(custom_attributes, dict)
