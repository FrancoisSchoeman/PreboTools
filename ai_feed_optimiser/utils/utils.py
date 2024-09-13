import requests
import xml.etree.ElementTree as ET
import csv
import traceback
from ai_feed_optimiser.models import Feed, FeedResults
from django.core.exceptions import ValidationError
from ai_feed_optimiser.utils.openai_integration import optimize_product


def process_feed(feed: Feed) -> tuple:
    """
    Process the feed data based on the file format and feed type.

    Args:
        feed (Feed): The Feed object containing the feed data.

    Returns:
        tuple: A tuple containing a boolean value indicating the success of the process and a list of messages.
    """
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


def process_xml(data: str, feed: Feed) -> tuple:
    """
    Process the XML data based on the feed type.

    Args:
        data (str): The XML data to be processed.
        feed (Feed): The Feed object containing the feed data.

    Returns:
        tuple: A tuple containing a boolean value indicating the success of the process and a list of messages.
    """

    root = ET.fromstring(data)
    items = root.findall(".//item")
    products = []
    messages = []

    # if limited_products is True:
    #     items = items[:5]

    # TODO: Remove the counter
    count = 1

    # try:
    #     # Check if a Feed with the same name already exists
    #     if Feed.objects.filter(name=feed.name).exists():
    #         raise ValidationError(
    #             f"A feed with the name '{feed.name}' already exists. Please run the optimization from the all feeds page."
    #         )
    # except ValidationError as ve:
    #     print([str(ve)])
    #     return (False, [str(ve)])

    for item in items:
        if count > 5:
            break

        product = {}

        if feed.feed_type == "wordpress":
            product = parse_wordpress_item(item)
        elif feed.feed_type == "shopify":
            product = parse_shopify_item(item)
        # TODO: Add more feed type parsers as needed

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
    # print(products)

    return (True, messages)


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
        if Feed.objects.filter(name=feed.name).exists():
            raise ValidationError(
                f"A feed with the name '{feed.name}' already exists. Please run the optimization from the all feeds page."
            )

    except ValidationError as ve:
        print([str(ve)])
        return (False, [str(ve)])

    for row in csv_reader:
        if count > 5:
            break

        product = {}

        if feed.feed_type == "wordpress":
            product = parse_wordpress_row(row)
        elif feed.feed_type == "shopify":
            product = parse_shopify_row(row)
        # TODO: Add more feed type parsers as needed

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


def parse_wordpress_item(item: ET.Element) -> dict:
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


def parse_shopify_item(item: ET.Element) -> dict:
    """
    Parse the item attributes for a Shopify XML feed.

    Args:
        item (Element): The XML Element containing the item attributes.

    Returns:
        dict: A dictionary containing the parsed item attributes.
    """

    # TODO: Implement parsing logic specific to Shopify XML feeds
    raise NotImplementedError("Parsing Shopify XML feeds is not yet implemented.")

    product = {}
    for child in item:
        product[child.tag] = child.text
    return product


def parse_wordpress_row(row: dict) -> dict:
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


def parse_shopify_row(row: dict) -> dict:
    """
    Parse the row attributes for a Shopify CSV feed.

    Args:
        row (dict): A dictionary containing the row attributes.

    Returns:
        dict: A dictionary containing the parsed row attributes
    """
    # Implement parsing logic specific to Shopify CSV feeds
    raise NotImplementedError("Parsing Shopify CSV feeds is not yet implemented.")

    product = {}
    for key, value in row.items():
        product[key] = value
    return product


def handle_uploaded_file(file, feed_name: str, limited_products_import: bool) -> tuple:
    """
    Handle the uploaded file based on the file type.

    Args:
        file (File): The uploaded file.
        feed_name (str): The name of the feed.

    Returns:
        tuple: A tuple containing a boolean value indicating the success of the process, a list of messages, and the feed ID.
    """
    if file.content_type == "text/xml":
        print("XML file detected")

        # Process the XML file
        raise NotImplementedError("Processing XML files is not yet implemented.")

    elif file.content_type == "text/csv":
        print("CSV file detected")

        # Process the CSV file
        data = file.read().decode("utf-8")
        process_success, process_messages, feed_id = process_csv_file(
            data, feed_name, limited_products_import
        )

        return (process_success, process_messages, feed_id)

    else:
        print("Unsupported file type")
        return (False, ["Unsupported file type"], None)


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
        if Feed.objects.filter(name=feed_name).exists():
            raise ValidationError(
                f"A feed with the name '{feed_name}' already exists. Please run the optimization from the all feeds page."
            )

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

    # print(products)

    return (True, messages, feed.pk)


def refresh_single_product(feed, product):
    """
    Refresh a single product in the feed.

    Args:
        feed (Feed): The Feed object containing the product.
        product (FeedResults): The FeedResults object to be refreshed.

    Returns:
        list: A list of messages indicating the result of the refresh operation.
    """
    try:
        product_dict = {}

        for field in product._meta.fields:
            product_dict[field.name] = getattr(product, field.name)

        # Extend custom atrributes to the product_dict
        for key, value in product.custom_attributes.items():
            product_dict[key] = value

        del product_dict["feed"]
        del product_dict["custom_attributes"]

        product_dict["id"] = product_dict.pop("product_id")

        optimized_product = optimize_product(product_dict)

        for key, value in optimized_product.items():
            setattr(product, key, value)

        product.save()

        return ["Product refreshed successfully!"]
    except Exception as e:
        print(f"Failed to refresh product: {e}\n{traceback.format_exc()}")
        return [f"Failed to refresh product: {e}"]
