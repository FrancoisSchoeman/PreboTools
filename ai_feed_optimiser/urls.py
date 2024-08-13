from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="feed_optimiser"),
    path("all-feeds/", views.all_feeds, name="all_feed_optimiser_feeds"),
    path("results/<int:feed_id>/", views.results, name="feed_optimiser_results"),
]
