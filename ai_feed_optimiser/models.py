from django.db import models


class Feed(models.Model):
    FEED_TYPE_CHOICES = [
        ("wordpress", "WordPress"),
        ("shopify", "Shopify"),
        ("other", "Other"),
        # TODO: Add other types as needed
    ]

    FORMAT_CHOICES = [
        ("csv", "CSV"),
        ("xml", "XML"),
    ]

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=255, unique=True)
    url = models.URLField(null=True, blank=True)
    feed_type = models.CharField(max_length=50, choices=FEED_TYPE_CHOICES)
    file_format = models.CharField(max_length=3, choices=FORMAT_CHOICES)
    # limited_products = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class FeedResults(models.Model):
    feed = models.ForeignKey(Feed, related_name="results", on_delete=models.CASCADE)

    product_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    link = models.URLField()
    image_link = models.URLField()
    availability = models.CharField(max_length=50)
    price = models.CharField(max_length=255)
    color = models.CharField(max_length=50, blank=True)
    product_type = models.CharField(max_length=255, blank=True)
    brand = models.CharField(max_length=255, blank=True)
    identifier_exists = models.CharField(max_length=50, blank=True)
    material = models.CharField(max_length=255, blank=True)
    condition = models.CharField(max_length=50, blank=True)
    size = models.CharField(max_length=255, blank=True)
    custom_attributes = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Feed Results"

    def __str__(self):
        return f"Results for {self.feed.name}"
