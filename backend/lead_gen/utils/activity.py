from typing import Any

from lead_gen.models import ActivityLog, Client


def log_activity(
    event_type: str,
    message: str,
    client: Client | None = None,
    metadata: dict[str, Any] | None = None,
) -> ActivityLog:
    return ActivityLog.objects.create(
        client=client,
        event_type=event_type,
        message=message,
        metadata=metadata or {},
    )
