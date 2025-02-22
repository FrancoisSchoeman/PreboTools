import { redirect } from 'next/navigation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const id = (await params).id;

  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser/${id}/csv`;

  const res = await fetch(apiURL, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  if (res.ok) {
    return res;
  }

  redirect('/seo-analysis/all?error=true');
}
