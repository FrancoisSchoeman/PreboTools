import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();

  const apiURL = `${process.env.BACKEND_URL}/api/url-structure-breaker/convert`;

  const url = (formData.get('url') as string | null)?.trim() ?? '';
  const file = formData.get('file');

  const hasUrl = url.length > 0;
  const hasFile = file instanceof File && file.size > 0;

  if (hasUrl && hasFile) {
    return NextResponse.json(
      { message: 'Provide either a URL or a file, not both' },
      { status: 400 }
    );
  }

  if (!hasUrl && !hasFile) {
    return NextResponse.json(
      { message: 'Provide a sitemap URL or upload a sitemap file' },
      { status: 400 }
    );
  }

  const newFormData = new FormData();
  if (hasUrl) {
    newFormData.append('url', url);
  }
  if (hasFile && file instanceof File) {
    newFormData.append('file', file);
  }

  let res: Response;
  try {
    res = await fetch(apiURL, {
      method: 'POST',
      body: newFormData,
      headers: {
        'X-API-Key': process.env.INTERNAL_API_KEY!,
      },
    });
  } catch (error) {
    console.error('URL Structure Breaker backend unreachable:', error);
    return NextResponse.json(
      { message: 'URL Structure Breaker service unavailable' },
      { status: 502 }
    );
  }

  const raw = await res.text();
  let data: unknown = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    if (raw) console.error(raw);
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : 'Error during URL structure break';
    return NextResponse.json({ message }, { status: res.status });
  }

  return NextResponse.json(data, { status: 200 });
}
