import csv
import re

from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from keyword_analyser.utils.utils import compile_results


@login_required
def index(request):
    if request.method == "POST":
        try:
            data = request.POST
            location = data.get("location", "Gauteng, South Africa")
            locale = data.get("locale", "us")
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

            messages.success(request, "SEO analysis completed")
            return render(
                request,
                "keyword_analyser/index.html",
                {"message": "SEO analysis completed", "result": result},
            )
        except Exception as e:
            print(f"Error during SEO analysis: {e}")
            messages.error(
                request,
                "An error occurred during SEO analysis. Please try again later.",
            )
            return render(request, "keyword_analyser/index.html")

    return render(request, "keyword_analyser/index.html")


@login_required
def export_keyword_results_to_csv(request):
    try:
        result = request.session.get("result", {})

        # Create the HttpResponse object with the appropriate CSV header.
        response = HttpResponse(
            content_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="seo_analysis.csv"'},
        )

        user_intent_analysis = "- " + "- ".join(result["user_intent_analysis"])
        competitive_insights = "- " + "- ".join(result["competitive_insights"])
        seo_content_recommendations = "- " + "- ".join(
            result["seo_content_recommendations"]
        )
        content_and_blog_ideas = "- " + "- ".join(result["content_and_blog_ideas"])
        faq_creation_and_enhancements = "- " + "- ".join(
            result["faq_creation_and_enhancements"]
        )

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
                user_intent_analysis,
                competitive_insights,
                seo_content_recommendations,
                content_and_blog_ideas,
                faq_creation_and_enhancements,
            ]
        )

        return response

    except Exception as e:
        print(f"Error exporting CSV: {e}")
        messages.error(
            request,
            "An error occurred while exporting the CSV. Please try again later.",
        )
        return render(request, "keyword_analyser/index.html")
