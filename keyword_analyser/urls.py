from django.urls import path
from . import views

app_name = "keyword_analyser"

urlpatterns = [
    path("", views.index, name="keyword_analyser"),
    path(
        "export-csv/",
        views.export_keyword_results_to_csv,
        name="export_keyword_results_to_csv",
    ),
]
