from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from ninja import Schema


class Error(Schema):
    message: str


class SuccessMessage(Schema):
    success: bool
    message: str


class FormSubmitOutSchema(Schema):
    success: bool
    submission_id: int
    submission_uuid: UUID
    email_sent: bool
    email_skipped: bool


class ClientInSchema(Schema):
    company_name: str
    contact_email: str
    website_url: str = ""
    timezone: str = "Africa/Johannesburg"
    internal_notes: str = ""
    is_active: bool = True
    auto_email_enabled: bool = True
    google_offline_enabled: bool = False
    leads_csv_enabled: bool = False
    conversion_name: str = ""
    conversion_action_id: str = ""
    currency: str = "ZAR"
    default_conversion_value: Optional[Decimal] = None


class ClientUpdateSchema(Schema):
    company_name: Optional[str] = None
    contact_email: Optional[str] = None
    website_url: Optional[str] = None
    timezone: Optional[str] = None
    internal_notes: Optional[str] = None
    is_active: Optional[bool] = None
    auto_email_enabled: Optional[bool] = None
    google_offline_enabled: Optional[bool] = None
    leads_csv_enabled: Optional[bool] = None
    conversion_name: Optional[str] = None
    conversion_action_id: Optional[str] = None
    currency: Optional[str] = None
    default_conversion_value: Optional[Decimal] = None


class ClientOutSchema(Schema):
    id: int
    api_key: UUID
    company_name: str
    website_url: str
    contact_email: str
    timezone: str
    internal_notes: str
    is_active: bool
    auto_email_enabled: bool
    google_offline_enabled: bool
    leads_csv_enabled: bool
    conversion_name: str
    conversion_action_id: str
    currency: str
    default_conversion_value: Optional[Decimal]
    last_submission_at: Optional[datetime] = None
    last_csv_export_at: Optional[datetime] = None
    last_leads_csv_export_at: Optional[datetime] = None
    date_created: datetime
    date_modified: datetime


class ClientDetailSchema(ClientOutSchema):
    form_endpoint: str
    csv_endpoint: str
    leads_csv_endpoint: str


class ClientStatsSchema(Schema):
    todays_leads: int
    total_leads: int
    last_submission_at: Optional[datetime]
    last_csv_export_at: Optional[datetime]
    last_leads_csv_export_at: Optional[datetime]


class HealthCheckItemSchema(Schema):
    key: str
    label: str
    ok: bool
    detail: str


class ClientHealthSchema(Schema):
    checks: list[HealthCheckItemSchema]


class ActivityLogSchema(Schema):
    id: int
    client_id: Optional[int]
    event_type: str
    message: str
    metadata: dict[str, Any]
    created_at: datetime


class SmtpServerOutSchema(Schema):
    id: str
    name: str
    host: str
    port: int
    from_email: str
    is_default: bool
    is_read_only: bool
    client_count: int
    status_ok: bool
    status_detail: str


class FormSubmissionOutSchema(Schema):
    id: int
    client_id: int
    submission_uuid: UUID
    gclid: str
    gbraid: str
    wbraid: str
    email: str
    phone: str
    first_name: str
    last_name: str
    landing_page: str
    utm_source: str
    utm_medium: str
    utm_campaign: str
    utm_term: str
    utm_content: str
    email_sent: bool
    email_error: str
    imported: bool
    lead_status: str
    lead_score: str
    submitted_at: datetime


class FormSubmissionDetailSchema(FormSubmissionOutSchema):
    raw_payload: dict[str, Any]
    conversion_value: Optional[Decimal]
    conversion_currency: str
    country_code: str
    postal_code: str
    email_sent_at: Optional[datetime]
    email_error: str
    notification_email: str


class ResendEmailOutSchema(Schema):
    success: bool
    message: str
    email_sent: bool


class FormSubmissionUpdateSchema(Schema):
    imported: Optional[bool] = None
    lead_status: Optional[str] = None
