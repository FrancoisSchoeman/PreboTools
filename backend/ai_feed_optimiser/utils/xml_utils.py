import xml.etree.ElementTree as ET
import traceback
from ai_feed_optimiser.models import Feed, FeedResults
from django.core.exceptions import ValidationError
from ai_feed_optimiser.utils.openai_integration import optimize_product


def process_xml(data: str, feed: Feed) -> tuple:
    """
    Process the XML data based on the feed type.

    Args:
        data (str): The XML data to be processed.
        feed (Feed): The Feed object containing the feed data.

    Returns:
        tuple: A tuple containing the reponse code and a message.
    """
    root = ET.fromstring(data)
    items = root.findall(".//item")
    products = []
    message = ""

    for item in items:
        product = {}

        product = parse_xml_item(item)

        optimized_product = optimize_product(product)
        products.append(optimized_product)

        try:
            FeedResults.create(feed, optimized_product)

        except Exception as e:
            print(
                f"Failed to optimise product: {e}\n{traceback.format_exc()}\n\n{optimized_product}"
            )

            message += f"\nFailed to optimise product: {e}"

    if len(products) == 0:
        return 404, {"message": "No products found in the XML feed."}

    return 200, {"message": message}


def parse_xml_item(item: ET.Element) -> dict:
    """
    Parse the item attributes for a WordPress XML feed.

    Args:
        item (Element): The XML Element containing the item attributes.

    Returns:
        dict: A dictionary containing the parsed item attributes.
    """
    product = {}
    for child in item:
        product[child.tag] = child.text
    return product


def process_xml_file(data, feed_name, limited_products) -> tuple:
    root = ET.fromstring(data)
    items = root.findall(".//item")
    products = []
    message = ""
    total_count = len(items)

    if limited_products is True:
        total_count = 5

    try:
        # Check if a Feed with the same name already exists
        Feed.raise_if_feed_exists(feed_name)

    except ValidationError as ve:
        print([str(ve)])
        return 403, {"message": str(ve)}

    # Create a new Feed object
    feed = Feed(name=feed_name, feed_type="other", file_format="xml")
    feed.save()

    # TODO: Remove the counter
    count = 1

    for item in items:
        if count > total_count:
            break

        product = {}

        product = parse_xml_item(item)

        optimized_product = optimize_product(product)
        products.append(optimized_product)

        try:
            FeedResults.create(feed, optimized_product)

        except Exception as e:
            print(
                f"Failed to optimise product: {e}\n{traceback.format_exc()}\n\n{optimized_product}"
            )

            message += f"\nFailed to optimise product: {e}"

        count += 1

    if len(products) == 0:
        feed.delete()
        return 404, {"message": "No products found in the XML feed."}

    return 200, {"message": message, "id": feed.pk}
