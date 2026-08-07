from PIL import Image as ImagePIL, ImageOps
import io
import re
import zipfile
from pathlib import Path
from image_resizer.models import Image
from typing import List, Set, Union


MIN_TARGET_PX = 1
MAX_TARGET_PX = 10_000
IMAGE_NAME_MAX_LEN = 100

# Formats that can store an alpha channel
_FORMATS_WITH_ALPHA = {"PNG", "WEBP", "TIFF", "GIF", "ICO", "TGA"}

# Formats we reliably support for output
SUPPORTED_OUTPUT_FORMATS = {"JPEG", "JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"}


def apply_exif_orientation(image: ImagePIL.Image) -> ImagePIL.Image:
    """
    Apply the correct orientation to an image based on its EXIF data.
    Handles all EXIF orientation values (including mirrored ones).
    """
    try:
        transposed = ImageOps.exif_transpose(image)
        return transposed if transposed is not None else image
    except Exception:
        return image


def _clamp_size(width: int, height: int) -> tuple[int, int]:
    """Ensure resize dimensions are at least 1px."""
    return max(1, width), max(1, height)


def resize_landscape(im: ImagePIL.Image, target_width: int) -> ImagePIL.Image:
    """
    Resize an image to a specified width while maintaining the aspect ratio.
    """
    width = float(im.size[0])
    height = float(im.size[1])

    if target_width == width:
        return im

    width_ratio = target_width / width
    target_height = int(height * width_ratio)
    target_width, target_height = _clamp_size(target_width, target_height)

    return im.resize((target_width, target_height), ImagePIL.Resampling.LANCZOS)


def resize_portrait(im: ImagePIL.Image, target_height: int) -> ImagePIL.Image:
    """
    Resize an image to a specified height while maintaining the aspect ratio.
    """
    width = float(im.size[0])
    height = float(im.size[1])

    if target_height == height:
        return im

    height_ratio = target_height / height
    target_width = int(width * height_ratio)
    target_width, target_height = _clamp_size(target_width, target_height)

    return im.resize((target_width, target_height), ImagePIL.Resampling.LANCZOS)


def _normalize_save_format(img_format: str) -> str:
    """Normalize user-facing format strings to Pillow save format names."""
    fmt = img_format.upper().strip()
    if fmt in {"JPG", "JPE"}:
        return "JPEG"
    return fmt


def _extension_for_format(img_format: str) -> str:
    """File extension for a user-facing format string."""
    fmt = img_format.lower().strip()
    if fmt in {"jpeg", "jpg", "jpe"}:
        return "jpg"
    return fmt


def _has_transparency(image: ImagePIL.Image) -> bool:
    if image.mode in {"RGBA", "LA", "PA"}:
        return True
    if image.mode == "P" and "transparency" in image.info:
        return True
    return False


def _flatten_alpha(image: ImagePIL.Image, background=(255, 255, 255)) -> ImagePIL.Image:
    """Composite transparent pixels onto a solid background (RGB)."""
    rgba = image.convert("RGBA")
    flat = ImagePIL.new("RGB", rgba.size, background)
    flat.paste(rgba, mask=rgba.split()[3])
    return flat


def get_image_data(image: ImagePIL.Image, img_format: str) -> bytes:
    """
    Convert an image to a specified format and return the image data as bytes.

    Preserves transparency for formats that support alpha (PNG, WEBP, etc.).
    Formats without alpha (e.g. JPEG) get transparency flattened onto white.
    """
    fmt = _normalize_save_format(img_format)

    if _has_transparency(image):
        if fmt in _FORMATS_WITH_ALPHA:
            if image.mode != "RGBA":
                image = image.convert("RGBA")
        else:
            image = _flatten_alpha(image)
    elif image.mode != "RGB":
        image = image.convert("RGB")

    img_buffer = io.BytesIO()
    save_kwargs = {}
    if fmt == "JPEG":
        save_kwargs["quality"] = 95
    image.save(img_buffer, format=fmt, **save_kwargs)
    return img_buffer.getvalue()


def _safe_stem(filename: str) -> str:
    """Basename without extension; keeps dots in the stem (my.photo.png → my.photo)."""
    stem = Path(filename).stem
    # Drop any leftover path segments
    stem = Path(stem).name
    # Allow letters, digits, underscore, dash, dot; strip path/control junk
    stem = re.sub(r"[^\w.\-]+", "_", stem, flags=re.UNICODE).strip("._")
    return stem or "image"


def _unique_filename(filename: str, used: Set[str]) -> str:
    if filename not in used:
        used.add(filename)
        return filename

    stem = Path(filename).stem
    ext = Path(filename).suffix
    n = 1
    while True:
        candidate = f"{stem}_{n}{ext}"
        if candidate not in used:
            used.add(candidate)
            return candidate
        n += 1


def _truncate_name(name: str, max_len: int = IMAGE_NAME_MAX_LEN) -> str:
    if len(name) <= max_len:
        return name
    stem = Path(name).stem
    ext = Path(name).suffix
    keep = max_len - len(ext)
    if keep < 1:
        return name[:max_len]
    return f"{stem[:keep]}{ext}"


def validate_target_size(target: int) -> None:
    if not isinstance(target, int) or isinstance(target, bool):
        raise ValueError("Width must be an integer")
    if target < MIN_TARGET_PX or target > MAX_TARGET_PX:
        raise ValueError(
            f"Width must be between {MIN_TARGET_PX} and {MAX_TARGET_PX} pixels"
        )


def validate_output_format(img_format: str) -> str:
    fmt = _normalize_save_format(img_format)
    if fmt not in {_normalize_save_format(f) for f in SUPPORTED_OUTPUT_FORMATS}:
        supported = ", ".join(sorted({_extension_for_format(f) for f in SUPPORTED_OUTPUT_FORMATS}))
        raise ValueError(f"Unsupported format '{img_format}'. Supported: {supported}")
    return fmt


def archive_images(
    images: List[Union[str, io.BytesIO]],
    target_width: int,
    img_format: str,
    use_custom_name: bool,
    custom_name: str,
) -> io.BytesIO:
    """
    Archive a list of images into a zip file after resizing them based on the
    specified max dimension (longest side).
    """
    validate_target_size(target_width)
    validate_output_format(img_format)
    ext = _extension_for_format(img_format)

    if use_custom_name:
        custom_name = re.sub(r"[^\w\-]+", "_", (custom_name or "").strip(), flags=re.UNICODE)
        custom_name = custom_name.strip("._") or "image"

    zip_buffer = io.BytesIO()
    used_names: Set[str] = set()

    with zipfile.ZipFile(zip_buffer, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for n, image in enumerate(images):
            try:
                im = ImagePIL.open(image)
                im = apply_exif_orientation(im)
                # Animated / multi-frame: use first frame only
                try:
                    im.seek(0)
                except EOFError:
                    pass
                im = im.copy()
            except OSError:
                continue

            if im.size[0] < im.size[1]:
                img_resize = resize_portrait(im, target_width)
            else:
                img_resize = resize_landscape(im, target_width)

            if use_custom_name:
                filename = f"{custom_name}_{n}.{ext}"
            else:
                original_name = getattr(image, "name", f"image_{n}")
                filename = f"{_safe_stem(original_name)}_resized.{ext}"

            filename = _unique_filename(_truncate_name(filename), used_names)

            img_data = get_image_data(img_resize, img_format)
            zip_file.writestr(filename, img_data)

            new_image = Image(image_name=filename[:IMAGE_NAME_MAX_LEN])
            new_image.save()

    return zip_buffer
