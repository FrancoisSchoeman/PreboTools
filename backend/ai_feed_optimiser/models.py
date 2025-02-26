from django.db import models
from django.core.exceptions import ValidationError


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

    def __str__(self):
        return self.name

    @staticmethod
    def raise_if_feed_exists(feed_name):
        # Check if a Feed with the same name already exists
        if Feed.objects.filter(name=feed_name).exists():
            raise ValidationError(
                f"A feed with the name '{feed_name}' already exists. Please run the optimization from the all feeds page."
            )


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

    @staticmethod
    def create(feed, data):
        # Create a FeedResults object and save it to the database
        feed_results = FeedResults(feed=feed, **data)
        feed_results.save()
