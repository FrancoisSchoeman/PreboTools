import csv
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from .models import Feed
from .forms import FeedForm, UploadFileForm
from .utils.utils import process_feed, handle_uploaded_file


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
                return redirect(
                    "ai_feed_optimiser:feed_optimiser_results", feed_id=feed.pk
                )

            feed.delete()
    else:
        form = FeedForm()
        file_form = UploadFileForm()

    return render(
        request, "ai_feed_optimiser/index.html", {"form": form, "file_form": file_form}
    )


@login_required
def results(request, feed_id):
    feed = get_object_or_404(Feed, pk=feed_id)
    results = feed.results.all()
    return render(
        request,
        "ai_feed_optimiser/results.html",
        {"feed": feed, "feed_results": results},
    )


@login_required
def all_feeds(request):
    feeds = Feed.objects.all()
    return render(request, "ai_feed_optimiser/all-feeds.html", {"feeds": feeds})


@login_required
def process_file(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            process_success, process_messages, feed_id = handle_uploaded_file(
                request.FILES["file_input"], request.POST["feed_name"]
            )

            for message in process_messages:
                messages.info(request, message)

            if process_success and feed_id is not None:
                return redirect(
                    "ai_feed_optimiser:feed_optimiser_results", feed_id=feed_id
                )

            return HttpResponseRedirect(reverse("ai_feed_optimiser:feed_optimiser"))

    return redirect("ai_feed_optimiser:feed_optimiser")


@login_required
def delete_feed(request, feed_id):
    feed = get_object_or_404(Feed, pk=feed_id)
    feed.delete()
    return redirect("ai_feed_optimiser:all_feed_optimiser_feeds")


@login_required
def export_feed_to_csv(request, feed_id):
    feed = get_object_or_404(Feed, pk=feed_id)

    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(
        content_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{feed.name}_export.csv"'
        },
    )

    writer = csv.writer(response)

    column_names = [
        "Product ID",
        "Title",
        "Description",
        "Link",
        "Image Link",
        "Availability",
        "Price",
        "Product Type",
        "Brand",
        "Identifier Exists",
        "Material",
        "Condition",
        "Size",
        "Color",
    ]

    # Extend column names with keys from custom attributes
    custom_attributes = feed.results.last().custom_attributes.keys()

    if custom_attributes:
        column_names.extend(custom_attributes)

    writer.writerow(column_names)

    for result in feed.results.all():
        row = [
            result.product_id,
            result.title,
            result.description,
            result.link,
            result.image_link,
            result.availability,
            result.price,
            result.product_type,
            result.brand,
            result.identifier_exists,
            result.material,
            result.condition,
            result.size,
            result.color,
        ]

        # Extend row with values from custom attributes
        if custom_attributes:
            row.extend(result.custom_attributes.values())

        writer.writerow(row)

    return response
