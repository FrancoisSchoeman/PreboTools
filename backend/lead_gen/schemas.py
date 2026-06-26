from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from ninja import Schema


class Error(Schema):
    message: str


class FormSubmitOutSchema(Schema):
    success: bool
    submission_id: int
    submission_uuid: UUID
    email_sent: bool


class ClientInSchema(Schema):
    company_name: str
    contact_email: str
    website_url: str = ""
    timezone: str = "Africa/Johannesburg"
    internal_notes: str = ""
    is_active: bool = True
    google_offline_enabled: bool = False
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
    google_offline_enabled: Optional[bool] = None
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
    google_offline_enabled: bool
    conversion_name: str
    conversion_action_id: str
    currency: str
    default_conversion_value: Optional[Decimal]
    date_created: datetime
    date_modified: datetime


class ClientDetailSchema(ClientOutSchema):
    form_endpoint: str
    csv_endpoint: str


class FormSubmissionOutSchema(Schema):
    id: int
    submission_uuid: UUID
    gclid: str
    gbraid: str
    wbraid: str
    email: str
    phone: str
    first_name: str
    last_name: str
    landing_page: str
    email_sent: bool
    imported: bool
    submitted_at: datetime
