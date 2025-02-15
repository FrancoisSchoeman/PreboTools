import requests
import traceback
from ai_feed_optimiser.models import Feed
from ai_feed_optimiser.utils.openai_integration import optimize_product
from ai_feed_optimiser.utils.xml_utils import process_xml, process_xml_file
from ai_feed_optimiser.utils.csv_utils import process_csv, process_csv_file


def process_feed(feed: Feed) -> tuple:
    """
    Process the feed data based on the file format and feed type.

    Args:
        feed (Feed): The Feed object containing the feed data.

    Returns:
        tuple: A tuple containing the response code and a message.
    """
    response = requests.get(feed.url)

    if response.status_code != 200:
        return (
            response.status_code,
            {
                "message": f"Failed to fetch the feed data. Response code: {response.status_code}"
            },
        )

    if feed.file_format == "xml":
        data = response.content
        status_code, message = process_xml(data, feed)

    elif feed.file_format == "csv":
        data = response.content.decode("utf-8")
        status_code, message = process_csv(data, feed)

    return (status_code, message)


# TODO: Refactor this function to return a response code and a message
def handle_uploaded_file(file, feed_name: str, limited_products_import: bool) -> tuple:
    """
    Handle the uploaded file based on the file type.

    Args:
        file (File): The uploaded file.
        feed_name (str): The name of the feed.

    Returns:
        tuple: A tuple containing the response code and a message.
    """
    if file.content_type != "text/xml" and file.content_type != "text/csv":
        print("Unsupported file type")
        return 404, {"message": "Unsupported file type"}

    data = file.read().decode("utf-8")

    if file.content_type == "text/xml":
        print("XML file detected")

        # Process the XML file
        status_code, message = process_xml_file(
            data, feed_name, limited_products_import
        )

    elif file.content_type == "text/csv":
        print("CSV file detected")

        # Process the CSV file
        status_code, message = process_csv_file(
            data, feed_name, limited_products_import
        )

    return (status_code, message)


def refresh_single_product(product):
    """
    Refresh a single product in the feed.

    Args:
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

        return 200, {"message": "Product refreshed successfully"}
    except Exception as e:
        print(f"Failed to refresh product: {e}\n{traceback.format_exc()}")
        return 500, {"message": "Failed to refresh product"}
