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
        urls = re.split(r"[\r\n\t]+", data.get("urls", ""))
        keywords = re.split(r"[\r\n\t]+", data.get("keywords", ""))

        for url in urls:
            if not url.startswith("https"):
                return render(
                    request,
                    "keyword_analyser/index.html",
                    {"message": "All URLs must start with https://"},
                )

        results = compile_results(urls, keywords, location, locale)
        request.session["results"] = results  # Store results in session
        print(results)

        return render(
            request,
            "keyword_analyser/index.html",
            {"message": "SEO analysis completed", "results": results},
        )

    return render(request, "keyword_analyser/index.html")


@login_required
def export_keyword_results_to_csv(request):
    results = request.session.get("results", [])

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

    for result in results:
        writer.writerow(
            [
                result["url"],
                result["mapped_keyword"],
                result["meta_title"],
                result["meta_description"],
                result["new_title"],
                result["new_description"],
                result["insights"],
            ]
        )

    return response
