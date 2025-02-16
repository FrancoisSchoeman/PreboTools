import csv
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from .models import Feed
from .forms import FeedForm, UploadFileForm
from .utils.utils import process_feed, handle_uploaded_file, refresh_single_product

from ninja import Router, Form, File, UploadedFile
from typing import List
from .schemas import (
    Error,
    FeedSchema,
    FeedResultsSchema,
    FeedImportSchema,
    FeedUploadSchema,
)
from backend.api_header_key import header_key

router = Router()


@router.get("/all", response={200: List[FeedSchema], 403: Error}, auth=header_key)
def all_feeds(request):
    feeds = Feed.objects.all()

    if not feeds:
        return 403, {"message": "No feeds found."}

    return feeds


@router.post(
    "/create/import", response={200: FeedResultsSchema, 404: Error}, auth=header_key
)
def create(request, payload: FeedImportSchema):
    feed = Feed.objects.create(**payload.dict())

    status_code, message = process_feed(feed)

    print(message["message"])

    if status_code == 200:
        return {"feed": feed, "products": feed.results.all()}

    feed.delete()

    return status_code, message


@router.post(
    "/create/upload", response={200: FeedResultsSchema, 404: Error}, auth=header_key
)
def process_file(
    request,
    details: Form[FeedUploadSchema],
    file: File[UploadedFile],
):
    name = details.name
    limited_products_import = details.limited_products_import

    status_code, message = handle_uploaded_file(
        feed_name=name,
        file=file,
        limited_products_import=limited_products_import,
    )

    if status_code == 200:
        feed = Feed.objects.get(pk=message["id"])
        return {"feed": feed, "products": feed.results.all()}

    return status_code, message


@router.get(
    "/{feed_id}", response={200: FeedResultsSchema, 404: Error}, auth=header_key
)
def results(request, feed_id: int):
    feed = get_object_or_404(Feed, pk=feed_id)
    results = feed.results.all()

    if not feed:
        return 404, {"message": "Feed not found."}

    if not results:
        return 404, {"message": "No results found."}

    return {"feed": feed, "products": results}


@router.put(
    "/{feed_id}/refresh/{product_id}",
    response={200: FeedResultsSchema, 500: Error},
    auth=header_key,
)
def refresh_product(request, feed_id: int, product_id: int):
    feed = get_object_or_404(Feed, pk=feed_id)
    product = feed.results.get(product_id=product_id)

    status_code, message = refresh_single_product(product)

    if status_code == 200:
        return {"feed": feed, "products": feed.results.all()}

    return status_code, message


@router.delete("/{feed_id}", response={200: str}, auth=header_key)
def delete_feed(request, feed_id):
    feed = get_object_or_404(Feed, pk=feed_id)
    feed.delete()

    return 200, "Feed deleted."


@router.get("/{feed_id}/csv", auth=header_key)
def export_feed_to_csv(request: HttpRequest, response: HttpResponse, feed_id: int):
    feed = get_object_or_404(Feed, pk=feed_id)

    response["Content-Disposition"] = f'attachment; filename="{feed.name}_export.csv"'

    writer = csv.writer(response)

    column_names = [
        "id",
        "title",
        "description",
        "link",
        "image_link",
        "availability",
        "price",
        "product_type",
        "brand",
        "identifier_exists",
        "material",
        "condition",
        "size",
        "color",
    ]

    # Extend column names with keys from custom attributes
    try:
        custom_attributes = feed.results.last().custom_attributes.keys()

        if custom_attributes:
            column_names.extend(custom_attributes)
    except AttributeError:
        custom_attributes = None

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
