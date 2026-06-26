import os
from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from lead_gen.models import Client
from lead_gen.schemas import (
    ClientDetailSchema,
    ClientInSchema,
    ClientOutSchema,
    ClientUpdateSchema,
    Error,
    FormSubmissionOutSchema,
)

router = Router()


def _base_url() -> str:
    return os.environ.get("BASE_URL", "https://tools.prebodigital.co.za").rstrip("/")


def _client_detail(client: Client) -> ClientDetailSchema:
    base = _base_url()
    return ClientDetailSchema(
        id=client.id,
        api_key=client.api_key,
        company_name=client.company_name,
        website_url=client.website_url,
        contact_email=client.contact_email,
        timezone=client.timezone,
        internal_notes=client.internal_notes,
        is_active=client.is_active,
        google_offline_enabled=client.google_offline_enabled,
        conversion_name=client.conversion_name,
        conversion_action_id=client.conversion_action_id,
        currency=client.currency,
        default_conversion_value=client.default_conversion_value,
        date_created=client.date_created,
        date_modified=client.date_modified,
        form_endpoint=f"{base}/api/forms/{client.api_key}",
        csv_endpoint=f"{base}/api/google/{client.api_key}/offline-conversions.csv",
    )


@router.get("/clients", response={200: List[ClientOutSchema]})
def list_clients(request):
    return Client.objects.all()


@router.post("/clients", response={201: ClientDetailSchema})
def create_client(request, payload: ClientInSchema):
    client = Client.objects.create(**payload.model_dump())
    return 201, _client_detail(client)


@router.get("/clients/{client_id}", response={200: ClientDetailSchema, 404: Error})
def get_client(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    return _client_detail(client)


@router.patch("/clients/{client_id}", response={200: ClientDetailSchema, 404: Error})
def update_client(request, client_id: int, payload: ClientUpdateSchema):
    client = get_object_or_404(Client, pk=client_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    client.save()
    return _client_detail(client)


@router.post(
    "/clients/{client_id}/regenerate-key",
    response={200: ClientDetailSchema, 404: Error},
)
def regenerate_client_key(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    client.regenerate_api_key()
    return _client_detail(client)


@router.get(
    "/clients/{client_id}/submissions",
    response={200: List[FormSubmissionOutSchema], 404: Error},
)
def list_submissions(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    return client.submissions.all()
