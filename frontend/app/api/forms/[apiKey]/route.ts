const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: 'Invalid JSON body.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const apiURL = `${process.env.BACKEND_URL}/api/lead-gen/forms/${apiKey}`;

  const forwardHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (origin) forwardHeaders.Origin = origin;
  if (referer) forwardHeaders.Referer = referer;

  const res = await fetch(apiURL, {
    method: 'POST',
    headers: forwardHeaders,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({ message: 'Unexpected response.' }));

  return Response.json(data, {
    status: res.status,
    headers: CORS_HEADERS,
  });
}
