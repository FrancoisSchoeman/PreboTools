import logging
import serpapi
from prebo_tools.settings.secrets import SERP_API_KEY


def fetch_autocomplete_data(keyword):
    """
    Use SERP API Autocomplete API to analyze user behavior for the given keyword.
    """
    params = {
        "engine": "google_autocomplete",
        "q": keyword.strip(),
        "api_key": SERP_API_KEY,
    }
    try:
        # search = GoogleSearch(params)
        search = serpapi.search(params)
        results = search.as_dict()
        suggestions = [item.get("value", "") for item in results.get("suggestions", [])]

        print(f"Autocomplete Suggestions for '{keyword}': {suggestions}")

        return suggestions or ["No autocomplete data available"]
    except Exception as e:
        print(f"Error fetching autocomplete data for keyword '{keyword}': {e}")
        return ["Error fetching autocomplete data"]
