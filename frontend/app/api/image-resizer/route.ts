import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();

  const apiURL = `${process.env.BACKEND_URL}/api/image-resizer/resize`;

  const width = formData.get('width') as string | null;
  const imageFormat = formData.get('img-format') as string | null;
  const customName = (formData.get('custom-name') as string | null) ?? '';
  const images = formData.getAll('images');

  if (!width || !imageFormat || images.length === 0) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  const newFormData = new FormData();
  newFormData.append('width', width);
  newFormData.append('img_format', imageFormat);
  newFormData.append('custom_name', customName);
  images.forEach((image) => {
    newFormData.append('files', image);
  });

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
    console.error('Image resizer backend unreachable:', error);
    return NextResponse.json(
      { message: 'Image resizer service unavailable' },
      { status: 502 }
    );
  }

  if (!res.ok) {
    let message = 'Error during image processing';
    const raw = await res.text();
    try {
      const data = JSON.parse(raw);
      if (data?.message) message = data.message;
    } catch {
      if (raw) console.error(raw);
    }
    return NextResponse.json({ message }, { status: res.status });
  }

  const zip = await res.arrayBuffer();
  return new NextResponse(zip, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="resized_images.zip"',
    },
  });
}
