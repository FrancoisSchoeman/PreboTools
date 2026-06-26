from django.contrib import admin

from lead_gen.models import Client, FormSubmission


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "contact_email",
        "is_active",
        "google_offline_enabled",
        "api_key",
        "date_created",
    )
    list_filter = ("is_active", "google_offline_enabled")
    search_fields = ("company_name", "contact_email", "api_key")
    readonly_fields = ("api_key", "date_created", "date_modified")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "company_name",
                    "website_url",
                    "contact_email",
                    "timezone",
                    "internal_notes",
                    "is_active",
                    "api_key",
                )
            },
        ),
        (
            "Google Offline Conversions",
            {
                "fields": (
                    "google_offline_enabled",
                    "conversion_name",
                    "conversion_action_id",
                    "currency",
                    "default_conversion_value",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("date_created", "date_modified")},
        ),
    )


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "client",
        "email",
        "phone",
        "email_sent",
        "imported",
        "submitted_at",
    )
    list_filter = ("email_sent", "imported", "client")
    search_fields = ("email", "phone", "first_name", "last_name", "gclid")
    readonly_fields = (
        "submission_uuid",
        "raw_payload",
        "email_hashed",
        "phone_hashed",
        "first_name_hashed",
        "last_name_hashed",
        "submitted_at",
    )
