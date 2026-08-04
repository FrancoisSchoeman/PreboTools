# Form submit security (lead gen)

## Rate limiting

Public `POST /api/lead-gen/forms/{api_key}` is rate-limited per API key and per IP. Exceeded requests return `429` and are not stored.

## GTM MSR preview

Traffic from `gtm-msr.appspot.com` (GTM preview/debug) is detected via `landing_page` / related payload URL fields and `Origin`/`Referer` headers. Those requests are logged as `submission_rejected` (`reason: gtm_msr`), return `200` without creating a submission, and do not send notification email.
