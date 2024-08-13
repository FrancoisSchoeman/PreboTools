import requests
import xml.etree.ElementTree as ET
import csv
import traceback
from .models import Feed, FeedResults
from django.core.exceptions import ValidationError
from django.contrib import messages
from .openai_integration import optimize_product


def process_feed(feed: Feed):
    if feed.file_format == "xml":
        response = requests.get(feed.url)
        if response.status_code == 200:
            data = response.content
            process_success, process_messages = process_xml(data, feed)
        else:
            print(f"Failed to fetch XML feed from {feed.url}: {response.status_code}")
    elif feed.file_format == "csv":
        response = requests.get(feed.url)
        if response.status_code == 200:
            data = response.content.decode("utf-8")
            process_success, process_messages = process_csv(data, feed)
        else:
            print(f"Failed to fetch CSV feed from {feed.url}: {response.status_code}")

    return (process_success, process_messages)


def process_xml(data, feed: Feed):
    root = ET.fromstring(data)
    items = root.findall(".//item")
    products = []
    messages = []

    # TODO: Remove the counter
    count = 1

    # try:
    #     # Check if a Feed with the same name already exists
    #     if Feed.objects.filter(name=feed.name).exists():
    #         raise ValidationError(
    #             f"A feed with the name '{feed.name}' already exists. Please run the optimization from the all feeds page."
    #         )
    # except ValidationError as ve:
    #     print(str(ve))
    #     return (False, [str(ve)])

    for item in items:
        if count > 5:
            break

        product = {}

        if feed.feed_type == "wordpress":
            product = parse_wordpress_item(item)
        elif feed.feed_type == "shopify":
            product = parse_shopify_item(item)
        # Add more feed type parsers as needed

        optimized_product = optimize_product(product)
        products.append(optimized_product)

        try:
            # Create a FeedResults object and save it to the database
            feed_results = FeedResults(
                feed=feed, **optimized_product
            )  # Unpack the dictionary
            feed_results.save()

        except Exception as e:
            print(
                f"Failed to optimise product: {e}\n{traceback.format_exc()}\n\n{optimized_product}"
            )

            messages.append(f"Failed to optimise product: {e}")

        count += 1

    # You can save or display the optimized products as needed
    print(products)

    return (True, messages)


def process_csv(data, feed: Feed):
    csv_reader = csv.DictReader(data.splitlines())
    products = []
    messages = []

    # TODO: Remove the counter
    count = 1

    try:
        # Check if a Feed with the same name already exists
        if Feed.objects.filter(name=feed.name).exists():
            raise ValidationError(
                f"A feed with the name '{feed.name}' already exists. Please run the optimization from the all feeds page."
            )

    except ValidationError as ve:
        print(str(ve))
        return (False, [str(ve)])

    for row in csv_reader:
        if count > 5:
            break

        product = {}

        if feed.feed_type == "wordpress":
            product = parse_wordpress_row(row)
        elif feed.feed_type == "shopify":
            product = parse_shopify_row(row)
        # Add more feed type parsers as needed

        optimized_product = optimize_product(product)
        products.append(optimized_product)

        try:
            # Create a FeedResults object and save it to the database
            feed_results = FeedResults(
                feed=feed, **optimized_product
            )  # Unpack the dictionary
            feed_results.save()

        except Exception as e:
            print(
                f"Failed to optimise product: {e}\n{traceback.format_exc()}\n\n{optimized_product}"
            )

            messages.append(f"Failed to optimise product: {e}")

        count += 1

    # You can save or display the optimized products as needed
    print(products)

    return (True, messages)


def parse_wordpress_item(item):
    product = {}
    for child in item:
        product[child.tag] = child.text
    return product


def parse_shopify_item(item):
    # Implement parsing logic specific to Shopify XML feeds
    product = {}
    for child in item:
        product[child.tag] = child.text
    return product


def parse_wordpress_row(row):
    product = {}
    for key, value in row.items():
        product[key] = value
    return product


def parse_shopify_row(row):
    # Implement parsing logic specific to Shopify CSV feeds
    product = {}
    for key, value in row.items():
        product[key] = value
    return product
