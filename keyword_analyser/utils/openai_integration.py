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
                    "content": "You are a 10-year SEO expert with a proven track record of growing businesses on search organically.",
                },
                {
                    "role": "user",
                    "content": f"""Based on the following information, select the most relevant keyword for the URL:    
                                URL: {url}
                                Current Meta Title: {meta_title}
                                Current Meta Description: {meta_description}
                                Provided Keywords: {keywords}

                                Return the single most relevant keyword from the list based on the URL's content.
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

        # Debugging step
        # print(f"Parsed Results for '{url}':")
        # print(f"New Title: {new_title}")
        # print(f"New Description: {new_description}")
        # print(f"Insights: {insights}")

        return new_title, new_description, insights
    except Exception as e:
        print(f"Error parsing GPT-4 response for URL '{url}': {e}")
        return "N/A", "N/A", "Error parsing GPT-4 response"


def generate_seo_content(
    url, keyword, meta_title, meta_description, autocomplete_data, seo_data
):
    """
    Use GPT-4 to generate a new SEO title, description, and provide insights for a given keyword and URL.
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
                    "content": "You are a 10-year SEO expert with a proven track record of growing businesses on search organically.",
                },
                {
                    "role": "user",
                    "content": rf"""
                                    Based on the following information, provide the output in this exact format:
                                    
                                    1. SEO Title: [Your new SEO title]
                                    2. SEO Description: [Your new SEO description]
                                    3. Insights:
                                    - [Bullet point 1 summarizing user behavior or intent]\n
                                    - [Bullet point 2 summarizing user behavior or intent]\n
                                    - [Additional bullet points, if any]

                                    URL: {url}
                                    Current Meta Title: {meta_title}
                                    Current Meta Description: {meta_description}
                                    Selected Keyword: {keyword}
                                    Autocomplete Suggestions (User Search Behavior):
                                    {formatted_autocomplete}
                                    Google Search Results Page:
                                    {seo_data}

                                    The output must strictly follow the format above. Do not change the structure or naming of the sections. Ensure the insights are meaningful and concise, highlighting how users search for services related to the keyword. Observe patterns in the search behaviour to inform optimisation and new meta titles and descriptions and even how the body content must be positioned due to these patterns and observations.
                                    The new meta title may not be longer than 60 characters, and the new meta description may not be longer than 160 characters. Do not use the pipe symbol (|) in the meta title or description, rather use hyphens (-).
                                """,
                },
            ],
            max_tokens=500,
        )
        choices = response.choices
        message_content = choices[0].message.content

        # Parse the response
        new_title, new_description, insights = parse_gpt_response(message_content, url)
        return new_title, new_description, insights

    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(
            f"Error generating SEO content for URL '{url}': {message_content}"
        )
        raise e
