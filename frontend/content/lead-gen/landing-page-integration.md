# Lead Gen — Landing Page Integration

This guide covers how to connect a client landing page to PreboTools for lead capture, email notifications, and Google Offline Conversion imports.

## Prerequisites

1. A **Client** record exists in PreboTools Lead Gen (`/lead-gen/clients`).
2. The client has a valid **contact email** (notification recipient).
3. For Google CSV export: enable **Google Offline Conversions** on the client and set **Conversion Name** and **Currency**.

After creating a client, copy the **API key** from the client's **API** tab.

## Endpoints

| Purpose | Method | URL |
|---------|--------|-----|
| Form submission | `POST` | `{BASE_URL}/api/forms/{CLIENT_API_KEY}` |
| Google offline conversions CSV | `GET` | `{BASE_URL}/api/google/{CLIENT_API_KEY}/offline-conversions.csv` |
| Leads CSV (plain text) | `GET` | `{BASE_URL}/api/leads/{CLIENT_API_KEY}/submissions.csv` |

Production base URL: `https://tools.prebodigital.co.za`

## Client setup (PreboTools UI)

1. Go to **Lead Gen → Clients** and click **Add Client** (`/lead-gen/clients/new`).
2. Complete the onboarding wizard:
   - **Company name** — client display name
   - **Contact email** — receives lead notification emails
   - **Website URL** — optional
   - **Timezone** — used for conversion timestamps (default: `Africa/Johannesburg`)
3. On the **Google Offline** step (optional):
   - Enable **Google Ads Offline Conversion Imports**
   - Set **Conversion name** (must match Google Ads conversion action)
   - Set **Currency** (e.g. `ZAR`)
   - Set **Default conversion value** if leads don't send a value
4. After creation, open the client dashboard and go to the **API** tab to copy the **API key** and form submission endpoint.

You can also update Google settings later from the client's **Google Offline** tab.

## Landing page PHP integration

PreboTools is a **side-channel**: it stores leads and can send notification emails. It must **not** control whether the visitor’s form succeeds. Your site should keep its own form handling, validation, and spam protection (reCAPTCHA, etc.).

Use server-side PHP so the **API key stays on the server** and the browser never talks to PreboTools directly.

### Important: best-effort forwarding

Always finish your own success path (thank-you page, CRM, email) even if PreboTools returns an error, times out, or rate-limits (`429`). Log Prebo failures for debugging; do not show the user an error solely because Prebo rejected the payload.

### 1. Capture attribution on page load

Include this at the top of your landing page (or in a shared `includes/attribution.php`):

```php
<?php
session_start();

$attributionKeys = [
    'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

foreach ($attributionKeys as $key) {
    if (!empty($_GET[$key])) {
        $_SESSION[$key] = $_GET[$key];
    }
}
```

When a visitor arrives via `?gclid=...&utm_source=google`, values are stored in the PHP session until they submit the form.

### 2. Form handler — `submit-lead.php`

```php
<?php
session_start();

const CLIENT_API_KEY = 'YOUR-CLIENT-API-KEY-HERE';
const PREBO_FORMS_URL = 'https://tools.prebodigital.co.za/api/forms/' . CLIENT_API_KEY;

$attributionKeys = [
    'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// 1) Your own form processing first (validation, CRM, mail, etc.)
// ...

$payload = [
    'first_name'   => trim($_POST['first_name'] ?? ''),
    'last_name'    => trim($_POST['last_name'] ?? ''),
    'email'        => trim($_POST['email'] ?? ''),
    'phone'        => trim($_POST['phone'] ?? ''),
    'message'      => trim($_POST['message'] ?? ''),
    'landing_page' => $_SERVER['HTTP_REFERER'] ?? '',
];

foreach ($attributionKeys as $key) {
    $payload[$key] = trim($_POST[$key] ?? $_SESSION[$key] ?? '');
}

// 2) Best-effort forward to PreboTools — never block the user on failure
$ch = curl_init(PREBO_FORMS_URL);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
]);

$response = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($status < 200 || $status >= 300) {
    error_log('PreboTools form forward failed: HTTP ' . $status . ' ' . $curlErr);
}

// 3) Always complete YOUR success path
header('Location: /thank-you');
exit;
```

Any additional fields you add to `$payload` are stored in `raw_payload` and included in the notification email.

### 3. Landing page form

```php
<?php require_once 'includes/attribution.php'; ?>

<form method="post" action="/submit-lead.php">
  <input type="text" name="first_name" required>
  <input type="text" name="last_name" required>
  <input type="email" name="email" required>
  <input type="tel" name="phone" required>
  <textarea name="message"></textarea>

  <?php foreach ($attributionKeys as $key): ?>
    <input
      type="hidden"
      name="<?= htmlspecialchars($key) ?>"
      value="<?= htmlspecialchars($_SESSION[$key] ?? '') ?>"
    >
  <?php endforeach; ?>

  <button type="submit">Send</button>
</form>
```

Hidden fields pass attribution through if the user navigates between pages before submitting. The session fallback in `submit-lead.php` covers cases where hidden fields are empty.

Prefer server-side PHP so the API key is not exposed. If the key is used from the browser (e.g. GTM), treat it as public and rely on PreboTools rate limiting to limit scripted spam.

## Example payload

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "0123456789",
  "message": "Please call me",
  "gclid": "EAIaIQob...",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand",
  "landing_page": "https://client.com/contact",
  "conversion_value": 350,
  "conversion_currency": "ZAR",
  "lead_score": "warm"
}
```

### Optional: lead score

Clients may include an optional `lead_score` field if they calculate lead quality on their side. Accepted values:

- `cold`
- `warm`
- `hot`

If omitted or invalid, the submission is still accepted and the score is stored as **Not set**.

## Response

Success (`200`):

```json
{
  "success": true,
  "submission_id": 42,
  "submission_uuid": "a1b2c3d4-...",
  "email_sent": true,
  "email_skipped": false
}
```

The submission is always saved on success. `email_sent` is `false` when automatic notifications are disabled for the client (`email_skipped: true`) or when SMTP delivery failed (check the submission record for `email_error`).

Invalid or inactive API key returns `404`.

| Status | Meaning |
|--------|---------|
| `400` | Invalid JSON / payload |
| `404` | Unknown or inactive API key |
| `429` | Rate limit exceeded — payload **not** stored; your site form should still succeed |

## Rate limiting (PreboTools only)

Protects this tool from scripted floods using a leaked API key. It does **not** replace website form spam protection.

Defaults (override with env `LEAD_GEN_RATE_LIMIT_PER_KEY` / `LEAD_GEN_RATE_LIMIT_PER_IP`):

- **300** submissions per minute per API key
- **600** submissions per minute per client IP

Exceeded requests return `429` and are logged as `submission_rejected`. Callers must still complete their own thank-you / success flow.

## Google Ads CSV import

1. Enable Google offline conversions on the client in the **Google Offline** tab.
2. Copy the **CSV Feed URL** from that tab and use it in Google Ads scheduled import:

   `https://tools.prebodigital.co.za/api/google/{CLIENT_API_KEY}/offline-conversions.csv`

3. CSV includes Google-required columns (GCLID, conversion name/time, hashed PII) plus internal audit columns (UTM params, landing page, etc.).

For Google Ads setup instructions, see the **Google Offline** tab on the client dashboard.

## Leads CSV export (Google Sheets / App Script)

Use this feed when you need **unhashed** lead data (email, phone, names) in a spreadsheet or external tool. Unlike the Google offline conversions CSV, contact fields are exported in plain text.

1. Enable **Leads CSV export** on the client's **API** tab.
2. Copy the **CSV Feed URL**:

   `https://tools.prebodigital.co.za/api/leads/{CLIENT_API_KEY}/submissions.csv`

3. Optional incremental sync — append a `since` query parameter (ISO 8601 UTC):

   `https://tools.prebodigital.co.za/api/leads/{CLIENT_API_KEY}/submissions.csv?since=2026-07-01T00:00:00Z`

   Returns only submissions received on or after that timestamp.

### Google Sheets App Script example

```javascript
const url = 'https://tools.prebodigital.co.za/api/leads/{CLIENT_API_KEY}/submissions.csv';
const props = PropertiesService.getScriptProperties();
const since = props.getProperty('lastPull');
const fetchUrl = since ? `${url}?since=${encodeURIComponent(since)}` : url;

const response = UrlFetchApp.fetch(fetchUrl);
const csv = response.getContentText();
// Parse CSV and append rows to your sheet, then store a new lastPull timestamp:
// props.setProperty('lastPull', new Date().toISOString());
```

Set up a time-driven trigger in Apps Script to run this on a schedule (e.g. hourly).

### CSV columns

Fixed columns: Submission ID, Submission UUID, Submitted At, Email, Phone, First Name, Last Name, Lead Score, Lead Status, Email Sent, Imported, GCLID, GBRAID, WBRAID, Landing Page, UTM Source/Medium/Campaign/Term/Content, Conversion Value, Conversion Currency, Country Code, Postal Code.

**Extra columns:** any additional top-level keys in the form JSON payload (for example `service_type`, `number_of_employees`) are saved on the submission and appear as further CSV headers for that client. Headers are discovered automatically from submissions in the export — you do not configure them in PreboTools. Known contact/UTM keys are not duplicated. Nested objects or arrays are written as a JSON string in a single cell.

The Google offline conversions CSV does **not** include these extra fields (it stays on Google’s fixed/hashed layout).

The feed returns `404` when leads CSV export is disabled for the client.
