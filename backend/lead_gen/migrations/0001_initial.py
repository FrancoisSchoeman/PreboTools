import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Client",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "api_key",
                    models.UUIDField(
                        db_index=True, default=uuid.uuid4, editable=False, unique=True
                    ),
                ),
                ("company_name", models.CharField(max_length=255)),
                ("website_url", models.URLField(blank=True)),
                ("contact_email", models.EmailField(max_length=254)),
                (
                    "timezone",
                    models.CharField(default="Africa/Johannesburg", max_length=63),
                ),
                ("internal_notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("google_offline_enabled", models.BooleanField(default=False)),
                ("conversion_name", models.CharField(blank=True, max_length=255)),
                ("conversion_action_id", models.CharField(blank=True, max_length=255)),
                ("currency", models.CharField(default="ZAR", max_length=3)),
                (
                    "default_conversion_value",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=12, null=True
                    ),
                ),
                ("date_created", models.DateTimeField(auto_now_add=True)),
                ("date_modified", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Lead Gen Client",
            },
        ),
        migrations.CreateModel(
            name="FormSubmission",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "submission_uuid",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("raw_payload", models.JSONField(default=dict)),
                ("gclid", models.CharField(blank=True, max_length=512)),
                ("gbraid", models.CharField(blank=True, max_length=512)),
                ("wbraid", models.CharField(blank=True, max_length=512)),
                ("email", models.CharField(blank=True, max_length=255)),
                ("phone", models.CharField(blank=True, max_length=64)),
                ("first_name", models.CharField(blank=True, max_length=255)),
                ("last_name", models.CharField(blank=True, max_length=255)),
                ("landing_page", models.CharField(blank=True, max_length=2048)),
                ("utm_source", models.CharField(blank=True, max_length=255)),
                ("utm_medium", models.CharField(blank=True, max_length=255)),
                ("utm_campaign", models.CharField(blank=True, max_length=255)),
                ("utm_term", models.CharField(blank=True, max_length=255)),
                ("utm_content", models.CharField(blank=True, max_length=255)),
                (
                    "conversion_value",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=12, null=True
                    ),
                ),
                ("conversion_currency", models.CharField(blank=True, max_length=3)),
                ("country_code", models.CharField(blank=True, max_length=2)),
                ("postal_code", models.CharField(blank=True, max_length=32)),
                ("lead_status", models.CharField(blank=True, max_length=64)),
                ("email_hashed", models.CharField(blank=True, max_length=64)),
                ("phone_hashed", models.CharField(blank=True, max_length=64)),
                ("first_name_hashed", models.CharField(blank=True, max_length=64)),
                ("last_name_hashed", models.CharField(blank=True, max_length=64)),
                ("email_sent", models.BooleanField(default=False)),
                ("email_sent_at", models.DateTimeField(blank=True, null=True)),
                ("email_error", models.TextField(blank=True)),
                ("imported", models.BooleanField(default=False)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                (
                    "client",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="submissions",
                        to="lead_gen.client",
                    ),
                ),
            ],
            options={
                "verbose_name": "Form Submission",
                "ordering": ["-submitted_at"],
            },
        ),
    ]
