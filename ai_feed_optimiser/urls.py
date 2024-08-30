from django.urls import path
from . import views

app_name = "ai_feed_optimiser"

urlpatterns = [
    path("", views.index, name="feed_optimiser"),
    path("all-feeds/", views.all_feeds, name="all_feed_optimiser_feeds"),
    path("delete-feed/<int:feed_id>/", views.delete_feed, name="delete_feed"),
    path(
        "export-feed-to-csv/<int:feed_id>/",
        views.export_feed_to_csv,
        name="export_feed_to_csv",
    ),
    path("process-file/", views.process_file, name="process_feed_file"),
    path("results/<int:feed_id>/", views.results, name="feed_optimiser_results"),
]
