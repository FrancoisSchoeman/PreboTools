export async function GET(
  request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : '';

  const apiURL = `${process.env.BACKEND_URL}/api/lead-gen/leads/${apiKey}/submissions.csv${querySuffix}`;

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
    'attachment; filename="leads.csv"';

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': disposition,
    },
  });
}
