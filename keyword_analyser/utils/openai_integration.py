import openai
import json
import logging
from prebo_tools.settings.secrets import OPENAI_SECRET


def map_relevant_keyword(url, keywords, meta_title, meta_description):
    """
    Use GPT-4 to map the most relevant keyword to the given URL.
    """
    try:
        client = openai.OpenAI(
            api_key=OPENAI_SECRET,
        )

        response = client.chat.completions.create(
            model="gpt-4",
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
                    """,
                },
            ],
            max_tokens=100,
        )

        choices = response.choices
        message_content = choices[0].message.content
        logging.info(f"Mapped Keyword for URL '{url}': {message_content}")
        return message_content
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(f"Problematic JSON for keyword URL {url}: {message_content}")
        raise e


def parse_gpt_response(result, url):
    """
    Parse GPT-4 response to extract the title, description, and insights.
    """
    try:
        lines = result.split("\n")

        # Extract the new title
        new_title = next(
            (
                line.split(":")[1].strip()
                for line in lines
                if line.startswith("1. SEO Title:")
            ),
            "N/A",
        )

        # Extract the new description
        new_description = next(
            (
                line.split(":")[1].strip()
                for line in lines
                if line.startswith("2. SEO Description:")
            ),
            "N/A",
        )

        # Identify the Insights section
        insights_start = next(
            (
                index
                for index, line in enumerate(lines)
                if line.startswith("3. Insights:")
            ),
            None,
        )
        if insights_start is not None:
            # Extract all lines under Insights that start with '-'
            insights_lines = [
                line.strip()
                for line in lines[insights_start + 1 :]
                if line.strip().startswith("-")
            ]
            insights = (
                " ".join(insights_lines) if insights_lines else "No insights available."
            )
        else:
            insights = "No insights available."

        # Identify the FAQs section
        faqs_start = next(
            (index for index, line in enumerate(lines) if line.startswith("4. FAQs:")),
            None,
        )
        if faqs_start is not None:
            # Extract all lines under Faqs that start with '-'
            faqs_lines = [
                line.strip()
                for line in lines[faqs_start + 1 :]
                if line.strip().startswith("-")
            ]
            faqs = " ".join(faqs_lines) if faqs_lines else "No FAQs available."
        else:
            faqs = "No FAQs available."

        # Identify the Content Ideas section
        content_ideas_start = next(
            (
                index
                for index, line in enumerate(lines)
                if line.startswith("5. Content Ideas:")
            ),
            None,
        )
        if content_ideas_start is not None:
            # Extract all lines under Content_ideas that start with '-'
            content_ideas_lines = [
                line.strip()
                for line in lines[content_ideas_start + 1 :]
                if line.strip().startswith("-")
            ]
            content_ideas = (
                " ".join(content_ideas_lines)
                if content_ideas_lines
                else "No content ideas available."
            )
        else:
            content_ideas = "No content ideas available."

        # Identify the Page Optimisation Ideas section
        page_optimisation_ideas_start = next(
            (
                index
                for index, line in enumerate(lines)
                if line.startswith("6: Page Optimization Ideas:")
            ),
            None,
        )
        if page_optimisation_ideas_start is not None:
            # Extract all lines under Page_optimisation_ideas that start with '-'
            page_optimisation_ideas_lines = [
                line.strip()
                for line in lines[page_optimisation_ideas_start + 1 :]
                if line.strip().startswith("-")
            ]
            page_optimisation_ideas = (
                " ".join(page_optimisation_ideas_lines)
                if page_optimisation_ideas_lines
                else "No page optimisation ideas available."
            )
        else:
            page_optimisation_ideas = "No page optimisation ideas available."

        return (
            new_title,
            new_description,
            insights,
            faqs,
            content_ideas,
            page_optimisation_ideas,
        )
    except Exception as e:
        print(f"Error parsing GPT-4 response for URL '{url}': {e}")
        return "N/A", "N/A", "Error parsing GPT-4 response"


def generate_seo_content(
    url, keyword, meta_title, meta_description, autocomplete_data, seo_data
):
    """
     Use GPT-4 to generate a structured SEO analysis, optimizing the title, description, and insights for a given keyword and URL.
    """
    formatted_autocomplete = "\n".join(autocomplete_data)

    try:
        client = openai.OpenAI(
            api_key=OPENAI_SECRET,
        )

        response = client.chat.completions.create(
            model="gpt-4",
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

                    **Output Format:**
                    
                    1. **Optimized SEO Title:** [New SEO title optimized for CTR and search intent. Limit: 60 characters.]
                    2. **Optimized SEO Description:** [New SEO meta description. Limit: 160 characters.]
                    3. **User Intent Analysis:**
                       - [Key insights from autocomplete data, top-ranking pages and related searches.]
                       - [What users are looking for based on search behavior.]
                       - [Industry and market movements based on news results on the term if any that is worthy considering.]
                    4. **Competitive Insights:**
                       - [Comparison of top-ranking pages, their structure, and gaps to leverage.]
                       - [Opportunities to outperform competitors through content improvements.]
                    5. **SEO Content Recommendations:**
                       - [Having browsed the website URL, when extracting meta title and description, based on your serp analysis data, provide Strategic content recommendations for better on-page optimization.]
                       - [How to improve keyword integration and topic relevance.]
                    6. **Content & Blog Ideas:**
                       - [5 Actionable blog topics to target long-tail keywords and improve authority.]
                    7. **FAQ & Creation & Enhancements:**
                       - [5 to 10 Recommended FAQs from People also ask data to add for better user engagement and featured snippets.]
                    
                    Ensure the output is highly actionable, expert-level, and formatted clearly. Avoid redundancy and focus on impactful improvements.
                    """,
                },
            ],
            max_tokens=800,
        )
        choices = response.choices
        message_content = choices[0].message.content

        # Parse the response
        (
            new_title,
            new_description,
            insights,
            faqs,
            content_ideas,
            page_optimisation_ideas,
        ) = parse_gpt_response(message_content, url)
        return (
            new_title,
            new_description,
            insights,
            faqs,
            content_ideas,
            page_optimisation_ideas,
        )

    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(
            f"Error generating SEO content for URL '{url}': {message_content}"
        )
        raise e
