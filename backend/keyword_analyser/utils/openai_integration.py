import openai
import json
import logging
import os
import re
from dotenv import load_dotenv

load_dotenv()

OPENAI_SECRET = os.environ.get("OPENAI_SECRET")
OPENAI_MODEL = "gpt-6-luna"


def _parse_json_content(message_content: str) -> dict:
    """Parse model JSON, stripping optional markdown code fences."""
    content = message_content.strip()
    fence_match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", content, re.DOTALL)
    if fence_match:
        content = fence_match.group(1).strip()
    return json.loads(content)


def map_relevant_keyword(url, keywords, meta_title, meta_description):
    """
    Use GPT-6 Luna to map the most relevant keyword to the given URL.
    """
    try:
        client = openai.OpenAI(
            api_key=OPENAI_SECRET,
        )

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an advanced SEO expert with 20+ years of experience, specializing in organic search growth and technical SEO strategies.",
                },
                {
                    "role": "user",
                    "content": f"""Analyze the following data and determine the most relevant keyword for the given URL:

                    URL: {url}
                    Meta Title: {meta_title}
                    Meta Description: {meta_description}
                    Provided Keywords: {keywords}

                    Select the most relevant keyword based on search intent, topic authority, and competitive positioning.
                    Only return the keyword itself and nothing else.
                    """,
                },
            ],
            max_completion_tokens=100,
            reasoning_effort="none",
        )

        choices = response.choices
        message_content = choices[0].message.content
        return message_content.strip() if message_content else message_content
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(f"Problematic JSON for keyword URL {url}: {message_content}")
        raise e


def generate_seo_content(
    url, keyword, meta_title, meta_description, autocomplete_data, seo_data
):
    """
    Use GPT-6 Luna to generate a structured SEO analysis, optimizing the title, description, and insights for a given keyword and URL.
    """
    formatted_autocomplete = "\n".join(autocomplete_data)

    try:
        client = openai.OpenAI(
            api_key=OPENAI_SECRET,
        )

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an advanced SEO expert with 20+ years of experience, specializing in technical SEO, content strategy, and conversion optimization.",
                },
                {
                    "role": "user",
                    "content": rf"""
                    Based on the following data, provide a structured and expert-level SEO analysis in the specified format:

                    URL: {url}
                    Selected Keyword: {keyword}
                    Meta Title: {meta_title}
                    Meta Description: {meta_description}
                    Autocomplete Suggestions (User Search Behavior):
                    {formatted_autocomplete}
                    SEO Data (Top Search Results, News, User Intent Analysis):
                    {seo_data}

                    Output Format:

                    {{
                        "new_title": "[New SEO title optimized for CTR and search intent. Limit: 60 characters.]",
                        "new_description": "[New SEO meta description. Limit: 160 characters.]",
                        "user_intent_analysis": [
                            "[Key insights from autocomplete data, top-ranking pages and related searches.]",
                            "[What users are looking for based on search behavior.]",
                            "[Industry and market movements based on news results on the term if any that is worthy considering.]"
                        ],
                        "competitive_insights": [
                            "[Comparison of top-ranking pages, their structure, and gaps to leverage.]",
                            "[Opportunities to outperform competitors through content improvements.]"
                        ],
                        "seo_content_recommendations": [
                            "[Having browsed the website URL, when extracting meta title and description, based on your serp analysis data, provide Strategic content recommendations for better on-page optimization.]",
                            "[How to improve keyword integration and topic relevance.]"
                        ],
                        "content_and_blog_ideas": [
                            "[5 Actionable blog topics to target long-tail keywords and improve authority.]",
                            "[5 Actionable blog topics to target long-tail keywords and improve authority.]",
                            "[5 Actionable blog topics to target long-tail keywords and improve authority.]",
                            "[5 Actionable blog topics to target long-tail keywords and improve authority.]",
                            "[5 Actionable blog topics to target long-tail keywords and improve authority.]"
                        ],
                        "faq_creation_and_enhancements": [
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]",
                            "[5 to 10 Recommended FAQs from the 'People also ask' data to add for better user engagement and featured snippets.]"
                        ]
                    }}
                    
                    Ensure the output is highly actionable, expert-level, and formatted clearly. Avoid redundancy and focus on impactful improvements.
                    All json keys need to be lowercase and snake case. Never include comments '//' in the output.
                    """,
                },
            ],
            max_completion_tokens=800,
            reasoning_effort="none",
            response_format={"type": "json_object"},
        )
        choices = response.choices
        message_content = choices[0].message.content

        return _parse_json_content(message_content)

    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(
            f"Error generating SEO content for URL '{url}': {message_content}"
        )
        raise e
