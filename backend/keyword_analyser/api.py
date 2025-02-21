import csv
from django.http import HttpRequest, HttpResponse

from keyword_analyser.utils.utils import compile_results
from .schemas import (
    KeywordAnalyserInSchema,
    KeywordAnalyserOutSchema,
    KeywordAnalyserResultsSchema,
    Error,
)

from ninja import Router


router = Router()


# TODO: Implement on frontend
@router.post("/", response={200: KeywordAnalyserResultsSchema, 404: Error})
def analyse(request, payload: KeywordAnalyserInSchema):
    location = payload.location
    locale = payload.locale
    url = payload.url
    # keywords = re.split(r"[\r\n\t]+", payload.get("keywords", ""))
    keywords = payload.keywords

    if not url.startswith("https"):
        return 404, {"message": "All URLs must start with https://"}

    try:
        results = compile_results(url, keywords, location, locale)
        print(results)

        return {"results": results}
    except Exception as e:
        return 404, {"message": str(e)}


# TODO: Implement on frontend
@router.get("/export/csv")
def export_keyword_results_to_csv(
    request: HttpRequest, response: HttpResponse, payload: KeywordAnalyserOutSchema
):
    try:
        data = {
            "url": payload.url,
            "mapped_keyword": payload.mapped_keyword,
            "meta_title": payload.meta_title,
            "meta_description": payload.meta_description,
            "new_title": payload.new_title,
            "new_description": payload.new_description,
            "insights": payload.insights,
        }

        # Create the HttpResponse object with the appropriate CSV header.
        response = HttpResponse(
            content_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="seo_analysis.csv"'},
        )

        writer = csv.writer(response)

        column_names = [
            "URL",
            "Mapped Keyword",
            "Current Title",
            "Current Description",
            "New SEO Title",
            "New SEO Description",
            "Insights",
        ]

        writer.writerow(column_names)

        writer.writerow(
            [
                data["url"],
                data["mapped_keyword"],
                data["meta_title"],
                data["meta_description"],
                data["new_title"],
                data["new_description"],
                data["insights"],
            ]
        )

        return response
    except Exception as e:
        return 404, {"message": str(e)}
