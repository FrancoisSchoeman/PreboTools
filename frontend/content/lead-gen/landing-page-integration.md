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

Use server-side PHP so the **API key stays on the server** and the browser never talks to PreboTools directly (no CORS, no exposed credentials).

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

$ch = curl_init(PREBO_FORMS_URL);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
]);

$response = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 200 && $status < 300) {
    header('Location: /thank-you');
    exit;
}

http_response_code(500);
echo 'Something went wrong. Please try again.';
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
  "email_sent": true
}
```

The submission is saved even if `email_sent` is `false` (SMTP error logged on the record).

Invalid or inactive API key returns `404`.

## Google Ads CSV import

1. Enable Google offline conversions on the client in the **Google Offline** tab.
2. Copy the **CSV Feed URL** from that tab and use it in Google Ads scheduled import:

   `https://tools.prebodigital.co.za/api/google/{CLIENT_API_KEY}/offline-conversions.csv`

3. CSV includes Google-required columns (GCLID, conversion name/time, hashed PII) plus internal audit columns (UTM params, landing page, etc.).

For Google Ads setup instructions, see the **Google Offline** tab on the client dashboard.
