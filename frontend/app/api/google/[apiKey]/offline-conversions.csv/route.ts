export async function GET(
  _request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await params;

  const apiURL = `${process.env.BACKEND_URL}/api/lead-gen/google/${apiKey}/offline-conversions.csv`;

  const res = await fetch(apiURL, { cache: 'no-store' });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const csv = await res.text();
  const disposition =
    res.headers.get('Content-Disposition') ??
    'attachment; filename="offline_conversions.csv"';

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': disposition,
    },
  });
}
