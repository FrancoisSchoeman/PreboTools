from ninja import Schema


class Error(Schema):
    message: str


class ImageCount(Schema):
    count: int


class ImageResizerIn(Schema):
    width: int
    img_format: str
    custom_name: str
