import csv
from typing import List
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from .models import AnalysedKeyword

from keyword_analyser.utils.utils import compile_results
from .schemas import (
    KeywordAnalyserInSchema,
    KeywordAnalyserOutSchema,
    KeywordAnalyserResultsSchema,
    Error,
)

from ninja import Router


router = Router()


@router.get(
    "/all", response={200: List[KeywordAnalyserOutSchema], 403: Error, 404: Error}
)
def all_analysed_keywords(request):
    results = AnalysedKeyword.objects.all()

    if not results:
        return 404, {"message": "No analysed keyword records found."}

    return results


@router.get("/{id}", response={200: KeywordAnalyserResultsSchema, 404: Error})
def results(request, id: int):
    results = get_object_or_404(AnalysedKeyword, pk=id)

    if not results:
        return 404, {"message": "Analysed keyword record not found."}

    return {"results": results}


@router.post("", response={200: KeywordAnalyserResultsSchema, 404: Error})
def analyse(request, payload: KeywordAnalyserInSchema):
    location = payload.location
    locale = payload.locale
    url = payload.url

    keywords = payload.keywords

    if not url.startswith("https"):
        return 404, {"message": "All URLs must start with https://"}

    try:
        data = compile_results(url, keywords, location, locale)
        print(data)
        results = AnalysedKeyword.objects.create(**data)

        return {"results": results}
    except Exception as e:
        return 404, {"message": str(e)}


@router.delete("/{id}", response={200: str})
def delete_analysed_keyword(request, id):
    data = get_object_or_404(AnalysedKeyword, pk=id)
    data.delete()

    return 200, "Analysed keyword deleted."


@router.get("/{id}/csv")
def export_keyword_results_to_csv(
    request: HttpRequest,
    response: HttpResponse,
    id: int,
):
    try:
        data = get_object_or_404(AnalysedKeyword, pk=id)

        user_intent_analysis = "- " + "- ".join(data.user_intent_analysis)
        competitive_insights = "- " + "- ".join(data.competitive_insights)
        seo_content_recommendations = "- " + "- ".join(data.seo_content_recommendations)
        content_and_blog_ideas = "- " + "- ".join(data.content_and_blog_ideas)
        faq_creation_and_enhancements = "- " + "- ".join(
            data.faq_creation_and_enhancements
        )

        # Create the HttpResponse object with the appropriate CSV header.
        response = HttpResponse(
            content_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="seo_analysis.csv"'},
        )

        writer = csv.writer(response)

        column_names = [
            "ID",
            "URL",
            "Mapped Keyword",
            "Current Title",
            "Current Description",
            "New SEO Title",
            "New SEO Description",
            "User Intent Analysis",
            "Competitive Insights",
            "SEO Content Recommendations",
            "Content & Blog Ideas",
            "FAQ Creation & Enhancements",
            "Date Created",
            "Date Modified",
        ]

        writer.writerow(column_names)

        writer.writerow(
            [
                data.pk,
                data.url,
                data.mapped_keyword,
                data.meta_title,
                data.meta_description,
                data.new_title,
                data.new_description,
                user_intent_analysis,
                competitive_insights,
                seo_content_recommendations,
                content_and_blog_ideas,
                faq_creation_and_enhancements,
                data.date_created,
                data.date_modified,
            ]
        )

        return response
    except Exception as e:
        return 404, {"message": str(e)}
