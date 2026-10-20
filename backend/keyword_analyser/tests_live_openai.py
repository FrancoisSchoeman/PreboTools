import os

import pytest
from dotenv import load_dotenv

load_dotenv()

pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_SECRET"),
    reason="OPENAI_SECRET not set; skipping live OpenAI tests",
)

REQUIRED_SEO_KEYS = {
    "new_title",
    "new_description",
    "user_intent_analysis",
    "competitive_insights",
    "seo_content_recommendations",
    "content_and_blog_ideas",
    "faq_creation_and_enhancements",
}

LIST_SEO_KEYS = REQUIRED_SEO_KEYS - {"new_title", "new_description"}


def test_map_relevant_keyword_returns_provided_keyword():
    from keyword_analyser.utils.openai_integration import map_relevant_keyword

    keywords = [
        "outdoor furniture",
        "wire chair cushion",
        "garden patio chairs",
    ]
    result = map_relevant_keyword(
        url="https://example.com/products/wire-chair-with-cushion",
        keywords=keywords,
        meta_title="Wire Chair with Cushion | Outdoor Seating",
        meta_description="Buy a durable wire chair with cushion for patio and garden use.",
    )

    assert isinstance(result, str)
    assert result.strip()
    assert result.strip() in keywords


def test_generate_seo_content_returns_expected_schema():
    from keyword_analyser.utils.openai_integration import generate_seo_content

    data = generate_seo_content(
        url="https://example.com/products/wire-chair-with-cushion",
        keyword="wire chair cushion",
        meta_title="Wire Chair with Cushion | Outdoor Seating",
        meta_description="Buy a durable wire chair with cushion for patio and garden use.",
        autocomplete_data=[
            "wire chair with cushion",
            "outdoor wire chair",
            "patio chair cushion",
        ],
        seo_data={
            "organic_results": [
                {
                    "title": "Best Outdoor Wire Chairs 2026",
                    "link": "https://competitor.example.com/wire-chairs",
                    "snippet": "Compare cushioned wire chairs for patio use.",
                }
            ],
            "related_questions": [
                {"question": "Are wire chairs comfortable outdoors?"},
                {"question": "How do I clean a wire chair cushion?"},
            ],
        },
    )

    assert isinstance(data, dict)
    assert REQUIRED_SEO_KEYS.issubset(data.keys())
    assert isinstance(data["new_title"], str) and data["new_title"].strip()
    assert isinstance(data["new_description"], str) and data["new_description"].strip()
    assert len(data["new_title"]) <= 60
    assert len(data["new_description"]) <= 160

    for key in LIST_SEO_KEYS:
        assert isinstance(data[key], list), f"{key} must be a list"
        assert len(data[key]) >= 1, f"{key} must not be empty"
        assert all(isinstance(item, str) and item.strip() for item in data[key]), (
            f"{key} items must be non-empty strings"
        )
