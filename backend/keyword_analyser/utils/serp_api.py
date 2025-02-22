import serpapi
import os
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.environ.get("SERP_API_KEY")


def analyze_seo_data(keyword, location="Gauteng, South Africa", gl="us"):
    """
    Perform an in-depth SEO analysis using SERP API for a given keyword, integrating organic search results, news results, and user intent.
    """
    params = {
        "q": keyword,
        "location": location,
        "hl": "en",
        "gl": gl,
        "tbm": "nws",
        "api_key": SERP_API_KEY,
    }

    search = serpapi.search(**params)
    data = search.as_dict()

    # Extracting top organic results
    top_results = data.get("organic_results", [])[:4] or []
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
    news_results = data.get("news_results", [])[:4] or []
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
            for q in data.get("related_questions", [])[:5] or []
        ],
    }

    # Return compiled data
    return {
        "keyword": keyword,
        "top_results_analysis": analyses,
        "news_analysis": news_analysis,
        "inferred_intent": inferred_intent,
    }


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
        search = serpapi.search(**params)
        results = search.as_dict()
        suggestions = [item.get("value", "") for item in results.get("suggestions", [])]

        # print(f"Autocomplete Suggestions for '{keyword}': {suggestions}")

        return suggestions or ["No autocomplete data available"]
    except Exception as e:
        print(f"Error fetching autocomplete data for keyword '{keyword}': {e}")
        return ["Error fetching autocomplete data"]
