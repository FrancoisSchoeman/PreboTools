import openai
import json
import logging
from prebo_tools.settings.secrets import OPENAI_SECRET


def optimize_product(item: dict) -> dict:
    """
    Optimize the product attributes for the provided product using OpenAI's GPT-3.5 model.

    Args:
        item (dict): A dictionary containing the product attributes.

    Returns:
        dict: A dictionary containing the optimized product attributes.

    Item Example:
    {
        "ID": 202204370148,
        "TITLE": "dd Chair Wire w/Cushion 78x69x74.5cm",
        "LINK": "https://storeandmore.co.za/product/dd-chair-wire-w-cushion-78x69x74-5cm/?utm_source=Google Shopping&utm_campaign=Google Feed&utm_medium=cpc&utm_term=202204370148",
        "IMAGE_LINK": "https://storeandmore.co.za/wp-content/uploads/2024/05/401-4-00035.jpg",
        "AVAILABILITY": "out_of_stock",
        "PRICE": "ZAR 799.00",
        "PRODUCT_TYPE": "Pets &amp; Outdoor||Outdoor||Outdoor Furniture",
        "CONDITION": "New",
        "IDENTIFIER_EXISTS": "no",
        "DESCRIPTION": ""
    }
    """
    try:
        client = openai.OpenAI(
            api_key=OPENAI_SECRET,
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """
                        You are an AI specialized in optimizing products for Google Merchant Centre and improving SEO. Optimize the following product by including relevant product attributes in a clear and consistent way. Ensure that the title, description, and attributes are attractive, concise, and follow best practices for both Google Merchant Centre and SEO.

                        Guidelines:
                        1. Include relevant product attributes such as title, description, link, image_link, availability, price, product_type, brand, identifier_exists, material, condition, size, color.
                        2. Keep the title under 150 characters.
                        3. Use consistent formatting.
                        4. Ensure that the most important keywords are at the beginning of the title.
                        5. Avoid unnecessary words and focus on clarity.
                        6. Ensure compliance with Google Merchant Centre policies, as found here: https://support.google.com/merchants/answer/7052112?hl=en.
                        7. If there are some attributes that are not applicable, simply return an empty value, for example: If material is not applicable, return "material": "".
                        8. The input data's keys might be in lowercase, but the values should be as provided in the example.
                        9. If there are any additional keys that are included in the input, you can include them in the output as well.
                        10. Any additional keys should be added as custom attributes in the output.

                        Here's an example of how the input might look (this is just an example and should not be used verbatim in your responses):
                        {"ID":202204370148,"TITLE":"dd Chair Wire w/Cushion 78x69x74.5cm","LINK":"https://storeandmore.co.za/product/dd-chair-wire-w-cushion-78x69x74-5cm/?utm_source=Google Shopping&utm_campaign=Google Feed&utm_medium=cpc&utm_term=202204370148","IMAGE_LINK":"https://storeandmore.co.za/wp-content/uploads/2024/05/401-4-00035.jpg","AVAILABILITY":"out_of_stock","PRICE":"ZAR 799.00","PRODUCT_TYPE":"Pets &amp; Outdoor||Outdoor||Outdoor Furniture","CONDITION":"New","IDENTIFIER_EXISTS":"no","DESCRIPTION":""}

                        And here is an example of how the output should be formatted (do not copy these values directly):
                        {
                            "product_id": "202204370148",
                            "title": "Wire Chair with Cushion | 78x69x74.5cm",
                            "description": "Elevate your space with the sleek and modern design of our Metal Chair with Wire Seat in Black. Perfect for both indoor and outdoor use, this versatile chair combines style and functionality. The durable metal frame ensures long-lasting stability, while the wire seat provides comfort and breathability. With its minimalist black finish, it effortlessly complements any decor, making it ideal for dining rooms, patios, cafes, and more.",
                            "link": "https://storeandmore.co.za/product/dd-chair-wire-w-cushion-78x69x74-5cm/?utm_source=Google Shopping&utm_campaign=Google Feed&utm_medium=cpc&utm_term=202204370148",
                            "image_link": "https://storeandmore.co.za/wp-content/uploads/2024/05/401-4-00035.jpg",
                            "availability": "out_of_stock",
                            "price": "ZAR 799.00",
                            "color": "Black",
                            "product_type": "Pets & Outdoor||Outdoor||Outdoor Furniture",
                            "brand": "dd",
                            "identifier_exists": "no",
                            "material": "Wire / Cotton",
                            "condition": "new",
                            "size": "78x69x74.5cm",
                            "custom_attributes": {
                                "custom_label_0": "New Arrivals",
                                "custom_label_1": "Free Shipping",
                                "custom_label_2": "Limited Stock"
                            }
                        }

                        Make sure not to include the string '{http://base.google.com/ns/1.0}' in the attribute names.

                        Now, optimize the product attributes for the provided product:
                        """,
                },
                {
                    "role": "user",
                    "content": f"Now generate the optimized product details for each attribute in JSON format, making sure not to copy the output example's values: {item}",
                },
            ],
        )

        choices = response.choices
        message_content = choices[0].message.content
        return json.loads(message_content)

    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(f"Problematic JSON: {message_content}")
        raise e
