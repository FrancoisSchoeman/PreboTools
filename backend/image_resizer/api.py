from django.http import HttpRequest, HttpResponse

from .utils.image_resizer import archive_images
from .models import Image

from ninja import Router, Form, File, UploadedFile
from typing import List
from .schemas import ImageResizerIn, ImageCount, Error


router = Router()


@router.get("/count", response={200: ImageCount})
def get_image_count(request):
    return {"count": Image.objects.count()}


@router.post("/resize")
def resize_image(
    request: HttpRequest,
    details: Form[ImageResizerIn],
    files: File[List[UploadedFile]],
):
    """
    Handle image upload, resize images based on the specified target width,
    and return a zip file containing the resized images.
    """
    try:
        if not files:
            return 400, {"message": "No images have been uploaded"}

        target_width = details.width
        img_format = details.img_format
        custom_name = details.custom_name or ""
        use_custom_name = custom_name.strip() != ""

        zip_buffer = archive_images(
            files, target_width, img_format, use_custom_name, custom_name
        )
        zip_buffer.seek(0)

        # Empty zip archive is 22 bytes
        if zip_buffer.getbuffer().nbytes <= 22:
            return 400, {"message": "No valid images could be processed"}

        response = HttpResponse(zip_buffer, content_type="application/zip")
        response["Content-Disposition"] = 'attachment; filename="resized_images.zip"'
        return response
    except ValueError as e:
        return 400, {"message": str(e)}
    except Exception as e:
        print(f"Error during image processing: {e}")
        return 500, {"message": f"Error during image processing: {e}"}
