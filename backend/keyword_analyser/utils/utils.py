import requests
from bs4 import BeautifulSoup
import concurrent.futures

from keyword_analyser.utils.openai_integration import (
    generate_seo_content,
    map_relevant_keyword,
)
from keyword_analyser.utils.serp_api import fetch_autocomplete_data, analyze_seo_data


def fetch_meta_data(url):
    """
    Fetch meta title and description from the provided URL.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string if soup.title else "N/A"
        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_desc = meta_desc["content"] if meta_desc else "N/A"
        return title, meta_desc
    except Exception as e:
        print(f"Error fetching metadata for {url}: {e}")
        return "N/A", "N/A"


def compile_results(url, keywords, location, locale):
    """
    Compile results by mapping URLs to the most relevant keywords, fetching autocomplete data,
    and generating SEO content.
    """
    meta_title, meta_description = fetch_meta_data(url)
    mapped_keyword = map_relevant_keyword(url, keywords, meta_title, meta_description)
    if mapped_keyword == "N/A":
        return

    # Use ThreadPoolExecutor to run analyze_seo_data and fetch_autocomplete_data concurrently
    with concurrent.futures.ThreadPoolExecutor() as executor:
        seo_data_future = executor.submit(
            analyze_seo_data, mapped_keyword, location, locale
        )
        autocomplete_data_future = executor.submit(
            fetch_autocomplete_data, mapped_keyword
        )

        # Wait for both futures to complete
        seo_data = seo_data_future.result()
        autocomplete_data = autocomplete_data_future.result()

    data = generate_seo_content(
        url,
        mapped_keyword,
        meta_title,
        meta_description,
        autocomplete_data,
        seo_data,
    )

    data["url"] = url
    data["mapped_keyword"] = mapped_keyword
    data["meta_title"] = meta_title
    data["meta_description"] = meta_description

    return data
