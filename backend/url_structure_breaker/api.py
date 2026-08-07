from django.http import HttpRequest

from ninja import Router, Form, File, UploadedFile

from .models import Conversion
from .schemas import ConvertIn, ConvertOut, ConversionCount, Error
from .utils.structure import break_urls
from sitemap_to_csv.utils.sitemap_parser import (
    SitemapParseError,
    convert_from_file,
    convert_from_url,
)

router = Router()


@router.get("/count", response={200: ConversionCount})
def get_conversion_count(request):
    return {"count": Conversion.objects.count()}


@router.post(
    "/convert",
    response={200: ConvertOut, 400: Error, 500: Error},
)
def convert_sitemap(
    request: HttpRequest,
    details: Form[ConvertIn],
    file: UploadedFile = File(None),
):
    """
    Parse a sitemap (URL or uploaded file) and split each URL into path segments.
    Exactly one of url or file is required.
    """
    try:
        url = (details.url or "").strip()
        has_url = bool(url)
        has_file = (
            file is not None
            and bool(getattr(file, "name", None))
            and (getattr(file, "size", None) or 0) > 0
        )

        if has_url and has_file:
            return 400, {"message": "Provide either a URL or a file, not both"}
        if not has_url and not has_file:
            return 400, {"message": "Provide a sitemap URL or upload a sitemap file"}

        if has_url:
            sitemap_rows = convert_from_url(url)
            source = url[:255]
        else:
            assert file is not None
            file_bytes = file.read()
            sitemap_rows = convert_from_file(file_bytes, filename=file.name or "")
            source = (file.name or "upload")[:255]

        locs = [row["loc"] for row in sitemap_rows]
        rows, max_depth = break_urls(locs)

        Conversion.objects.create(source=source, row_count=len(rows))

        return {"count": len(rows), "max_depth": max_depth, "rows": rows}
    except SitemapParseError as e:
        return 400, {"message": str(e)}
    except Exception as e:
        print(f"Error during URL structure break: {e}")
        return 500, {"message": f"Error during URL structure break: {e}"}
