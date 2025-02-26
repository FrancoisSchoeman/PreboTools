import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const formData = await request.formData();

  const apiURL = `${process.env.BACKEND_URL}/api/image-resizer/resize`;

  const width = formData.get('width') as string;
  const imageFormat = formData.get('img-format') as string;
  const customName = formData.get('custom-name') as string;
  const images = formData.getAll('images');

  const newFormData = new FormData();
  newFormData.append('width', width);
  newFormData.append('img_format', imageFormat);
  newFormData.append('custom_name', customName);
  // Append each image file with the same field name 'files'
  images.forEach((image) => {
    newFormData.append('files', image);
  });

  const res = await fetch(apiURL, {
    method: 'POST',
    body: newFormData,
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  if (res.ok) {
    return res;
  } else {
    console.error(res.text());
    redirect('/image-resizer?error=true');
  }
}
