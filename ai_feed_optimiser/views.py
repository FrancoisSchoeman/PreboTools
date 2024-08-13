from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Feed
from .forms import FeedForm
from .utils import process_feed


@login_required
def index(request):
    if request.method == "POST":
        form = FeedForm(request.POST)
        if form.is_valid():
            feed = form.save()
            process_success, process_messages = process_feed(feed)

            for message in process_messages:
                messages.info(request, message)

            if process_success:
                return redirect("feed_optimiser_results", feed_id=feed.pk)

            feed.delete()
    else:
        form = FeedForm()

    return render(request, "ai_feed_optimiser/index.html", {"form": form})


@login_required
def results(request, feed_id):
    feed = Feed.objects.get(pk=feed_id)
    feed_results = feed.results.all()
    return render(
        request,
        "ai_feed_optimiser/results.html",
        {"feed": feed, "feed_results": feed_results},
    )


@login_required
def all_feeds(request):
    feeds = Feed.objects.all()
    return render(request, "ai_feed_optimiser/all-feeds.html", {"feeds": feeds})
