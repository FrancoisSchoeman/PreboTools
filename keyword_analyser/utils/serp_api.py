import requests
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


def analyze_seo_data(keyword, location="Gauteng, South Africa", gl="us"):
    """
    Perform an in-depth SEO analysis using SERP API for a given keyword, integrating organic search results, news results, and user intent.
    """
    endpoint = f"https://serpapi.com/search.json?q={keyword}&location={location}&hl=en&gl={gl}&tbm=nws&api_key={SERP_API_KEY}"

    # Fetch data
    response = requests.get(endpoint)
    data = response.json()

    # Extracting top organic results
    top_results = data.get("organic_results", [])[:3]
    analyses = []
    for result in top_results:
        analysis = {
            "title": result["title"],
            "link": result["link"],
            "snippet": result["snippet"],
            "structured_data": (
                "Present" if "structured_data" in result else "Not present"
            ),
            "internal_links": len(result.get("links", [])),
        }
        analyses.append(analysis)

    # Extract news results
    news_results = data.get("news_results", [])
    news_analysis = []
    for news in news_results:
        news_info = {
            "title": news["title"],
            "source": news["source"],
            "date": news["date"],
            "snippet": news["snippet"],
            "link": news["link"],
        }
        news_analysis.append(news_info)

    # Inferring User Intent from autocomplete and related searches
    inferred_intent = {
        "related_searches": [
            search["query"] for search in data.get("related_searches", [])
        ],
        "autocomplete_suggestions": [
            suggestion for suggestion in data.get("related_searches", [])
        ],
        "people_also_ask": [
            {"question": q["question"], "answer": q["snippet"]}
            for q in data.get("related_questions", [])[:5]
        ],
    }

    # Return compiled data
    return {
        "keyword": keyword,
        "top_results_analysis": analyses,
        "news_analysis": news_analysis,
        "inferred_intent": inferred_intent,
    }
