import csv
import re

from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from keyword_analyser.utils.utils import compile_results

# Create your views here.
# TODO: Finish implemetation


@login_required
def index(request):
    if request.method == "POST":
        data = request.POST
        location = data.get("location", "Gauteng, South Africa")
        locale = data.get("locale", "us")
        # urls = re.split(r"[\r\n\t]+", data.get("urls", ""))
        url = data.get("url", "")
        keywords = re.split(r"[\r\n\t]+", data.get("keywords", ""))

        if not url.startswith("https"):
            return render(
                request,
                "keyword_analyser/index.html",
                {"message": "URL must start with https://"},
            )

        result = compile_results(url, keywords, location, locale)
        request.session["result"] = result  # Store results in session

        print(result)

        return render(
            request,
            "keyword_analyser/index.html",
            {"message": "SEO analysis completed", "result": result},
        )

    return render(request, "keyword_analyser/index.html")


@login_required
def export_keyword_results_to_csv(request):
    result = request.session.get("result", {})

    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(
        content_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="seo_analysis.csv"'},
    )

    insights = "- " + "- ".join(result["insights"])
    faqs = "- " + "- ".join(result["faqs"])
    content_ideas = "- " + "- ".join(result["content_ideas"])
    page_optimisation_ideas = "- " + "- ".join(result["page_optimisation_ideas"])

    writer = csv.writer(response)

    column_names = [
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
    ]

    writer.writerow(column_names)
    writer.writerow(
        [
            result["url"],
            result["mapped_keyword"],
            result["meta_title"],
            result["meta_description"],
            result["new_title"],
            result["new_description"],
            result["user_intent_analysis"],
            result["competitive_insights"],
            result["seo_content_recommendations"],
            result["content_and_blog_ideas"],
            result["faq_creation_and_enhancements"],
        ]
    )

    return response
