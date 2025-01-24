from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.conf import settings
from django.contrib import messages
import os

from .utils.image_resizer import archive_images
from .models import Image

def resize_image(request: HttpRequest) -> HttpResponse:
    """
    Handle image upload, resize images based on the specified target width, and return a zip file containing the resized images.

    Args:
        request (HttpRequest): The HTTP request object containing image files and form data.

    Returns:
        HttpResponse: A response containing a zip file with the resized images or the rendered HTML page.
    """
    context = {
        "images_count": Image.objects.count(),
    }

    if request.method == "POST" and request.FILES.getlist("images"):
        try:
            images = request.FILES.getlist("images")
            target_width = int(request.POST.get("target_width", 800))
            img_format = request.POST.get("format", "jpeg")
            use_custom_name = request.POST.get("use_custom_name", False)
            custom_name = request.POST.get("custom_name", "")
            path = os.path.join(settings.BASE_DIR, "resized_images/")

            os.makedirs(path, exist_ok=True)

            try:
                zip_buffer = archive_images(
                    images, target_width, img_format, use_custom_name, custom_name
                )
                zip_buffer.seek(0)

                # Check if the zip buffer is empty
                if (
                    zip_buffer.getbuffer().nbytes == 22
                    or zip_buffer.getbuffer().nbytes == 0
                ):
                    messages.error(
                        request,
                        "No images were processed.\nYour original image format may not be supported.",
                    )
                    return render(request, "image_resizer/index.html", context)

            except Exception as e:
                print(f"Error during image processing: {e}")
                messages.error(
                    request,
                    "An error occurred during image processing.\nPlease make sure that the image format is supported and that the image name is not too long.",
                )
                return render(request, "image_resizer/index.html", context)

            response = HttpResponse(zip_buffer, content_type="application/zip")
            response["Content-Disposition"] = (
                'attachment; filename="resized_images.zip"'
            )
            messages.success(request, "Images have been resized successfully!")

            return response
        except Exception as e:
            print(f"Error during image processing: {e}")

    return render(request, "image_resizer/index.html", context)

