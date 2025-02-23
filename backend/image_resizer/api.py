from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.conf import settings
from django.contrib import messages
import os

from .utils.image_resizer import archive_images
from .models import Image

from ninja import Router, Form, File, UploadedFile
from typing import List
from .schemas import ImageResizerIn, ImageCount, Error


router = Router()


@router.get("/count", response={200: ImageCount, 404: Error})
def get_image_count(request):
    count = Image.objects.count()

    if not count:
        return 404, {"message": "No results found"}

    return {"count": count}


@router.post("/resize")
def resize_image(
    request: HttpRequest,
    response: HttpResponse,
    details: Form[ImageResizerIn],
    files: File[List[UploadedFile]],
):
    """
    Handle image upload, resize images based on the specified target width, and return a zip file containing the resized images.

    Args:
        request (HttpRequest): The HTTP request object containing image files and form data.

    Returns:
        HttpResponse: A response containing a zip file with the resized images or the rendered HTML page.
    """
    try:
        target_width = details.width
        img_format = details.img_format
        custom_name = details.custom_name
        use_custom_name = False if details.custom_name == "" else True
        path = os.path.join(settings.BASE_DIR, "resized_images/")

        os.makedirs(path, exist_ok=True)

        zip_buffer = archive_images(
            files, target_width, img_format, use_custom_name, custom_name
        )
        zip_buffer.seek(0)

        # Check if the zip buffer is empty
        if zip_buffer.getbuffer().nbytes == 22 or zip_buffer.getbuffer().nbytes == 0:
            return 500, {"message": "No images have been uploaded"}

        response = HttpResponse(zip_buffer, content_type="application/zip")
        response["Content-Disposition"] = 'attachment; filename="resized_images.zip"'

        return response
    except Exception as e:
        print(f"Error during image processing: {e}")
        return 500, {"message": f"Error during image processing: {e}"}
