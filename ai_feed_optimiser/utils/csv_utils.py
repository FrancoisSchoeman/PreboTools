import csv
import traceback
from ai_feed_optimiser.models import Feed, FeedResults
from django.core.exceptions import ValidationError
from ai_feed_optimiser.utils.openai_integration import optimize_product


def process_csv(data: str, feed: Feed) -> tuple:
    """
    Process the CSV data based on the feed type.

    Args:
        data (str): The CSV data to be processed.
        feed (Feed): The Feed object containing the feed data.

    Returns:
        tuple: A tuple containing a boolean value indicating the success of the process and a list of messages.
    """

    csv_reader = csv.DictReader(data.splitlines())
    products = []
    messages = []

    # TODO: Remove the counter
    count = 1

    try:
        # Check if a Feed with the same name already exists
        Feed.raise_if_feed_exists(feed.name)

    except ValidationError as ve:
        print([str(ve)])
        return (False, [str(ve)])

    for row in csv_reader:
        if count > 5:
            break

        product = {}

        product = parse_csv_row(row)

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


def parse_csv_row(row: dict) -> dict:
    """
    Parse the row attributes for a WordPress CSV feed.

    Args:
        row (dict): A dictionary containing the row attributes.

    Returns:
        dict: A dictionary containing the parsed row attributes
    """
    product = {}
    for key, value in row.items():
        product[key] = value
    return product


def process_csv_file(data, feed_name, limited_products) -> tuple:
    """
    Process the CSV data and optimize the products.

    Args:
        data (str): The CSV data to be processed.
        feed_name (str): The name of the feed.

    Returns:
        tuple: A tuple containing a boolean value indicating the success of the process, a list of messages, and the feed ID.
    """
    csv_reader = csv.DictReader(data.splitlines())

    if limited_products is True:
        csv_reader = list(csv_reader)[:5]

    else:
        csv_reader = list(csv_reader)

    products = []
    messages = []

    try:
        # Check if a Feed with the same name already exists
        Feed.raise_if_feed_exists(feed_name)

    except ValidationError as ve:
        print([str(ve)])
        return (False, [str(ve)], None)

    # Create a new Feed object
    feed = Feed(name=feed_name, feed_type="other", file_format="csv")
    feed.save()

    for row in csv_reader:
        optimized_product = optimize_product(row)
        products.append(optimized_product)

        try:
            FeedResults.create(feed, optimized_product)

        except Exception as e:
            print(
                f"Failed to optimise product: {e}\n{traceback.format_exc()}\n\n{optimized_product}"
            )

            messages.append(f"Failed to optimise product: {e}")

    # print(products)

    return (True, messages, feed.pk)
