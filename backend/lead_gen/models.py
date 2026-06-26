import uuid

from django.db import models


class Client(models.Model):
    api_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    company_name = models.CharField(max_length=255)
    website_url = models.URLField(blank=True)
    contact_email = models.EmailField()
    timezone = models.CharField(max_length=63, default="Africa/Johannesburg")
    internal_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    google_offline_enabled = models.BooleanField(default=False)
    conversion_name = models.CharField(max_length=255, blank=True)
    conversion_action_id = models.CharField(max_length=255, blank=True)
    currency = models.CharField(max_length=3, default="ZAR")
    default_conversion_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    last_submission_at = models.DateTimeField(null=True, blank=True)
    last_csv_export_at = models.DateTimeField(null=True, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lead Gen Client"

    def __str__(self):
        return self.company_name

    def regenerate_api_key(self):
        self.api_key = uuid.uuid4()
        self.save(update_fields=["api_key", "date_modified"])


class FormSubmission(models.Model):
    submission_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    client = models.ForeignKey(Client, related_name="submissions", on_delete=models.CASCADE)

    raw_payload = models.JSONField(default=dict)

    gclid = models.CharField(max_length=512, blank=True)
    gbraid = models.CharField(max_length=512, blank=True)
    wbraid = models.CharField(max_length=512, blank=True)
    email = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=64, blank=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    landing_page = models.CharField(max_length=2048, blank=True)
    utm_source = models.CharField(max_length=255, blank=True)
    utm_medium = models.CharField(max_length=255, blank=True)
    utm_campaign = models.CharField(max_length=255, blank=True)
    utm_term = models.CharField(max_length=255, blank=True)
    utm_content = models.CharField(max_length=255, blank=True)
    conversion_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    conversion_currency = models.CharField(max_length=3, blank=True)
    country_code = models.CharField(max_length=2, blank=True)
    postal_code = models.CharField(max_length=32, blank=True)
    lead_status = models.CharField(max_length=64, blank=True)

    email_hashed = models.CharField(max_length=64, blank=True)
    phone_hashed = models.CharField(max_length=64, blank=True)
    first_name_hashed = models.CharField(max_length=64, blank=True)
    last_name_hashed = models.CharField(max_length=64, blank=True)

    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    email_error = models.TextField(blank=True)

    imported = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Form Submission"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.client.company_name} — {self.submitted_at:%Y-%m-%d %H:%M}"


class ActivityLog(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="activity_logs",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    event_type = models.CharField(max_length=64)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Activity Log"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type} — {self.created_at:%Y-%m-%d %H:%M}"
