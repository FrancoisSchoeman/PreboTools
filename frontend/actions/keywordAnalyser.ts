'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function analyseKeywordAction(formData: FormData) {
  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser`;

  const location = formData.get('keyword-location')?.toString() || '';
  const locale = formData.get('keyword-locale')?.toString() || '';
  const keywordUrl = formData.get('keyword-url')?.toString() || '';
  const rawKeywords = formData.get('keyword-keywords')?.toString() || '';

  if (!location || !locale || !keywordUrl || !rawKeywords) {
    console.error('FormData missing required fields');
    return redirect('/seo-analysis?error=invalid-form');
  }

  const keywords = rawKeywords.split(/\r?\n/);

  let data;

  // Use a separate try/catch just for fetch and parsing
  try {
    const res = await fetch(apiURL, {
      method: 'POST',
      body: JSON.stringify({ location, locale, url: keywordUrl, keywords }),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.INTERNAL_API_KEY!,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      return redirect('/seo-analysis?error=api-failure');
    }

    data = await res.json();
  } catch (err) {
    console.error('Fetch or parsing error:', err);
    return redirect('/seo-analysis?error=network');
  }

  // Validate the API response
  if (!data?.results) {
    console.error('Invalid API response format:', data);
    return redirect('/seo-analysis?error=invalid-data');
  }

  // Success path
  revalidatePath(`/seo-analysis/${data.results.id}`);
  return redirect(`/seo-analysis/${data.results.id}?success=true`);
}

export async function deleteKeywordAnalysisAction(id: number) {
  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser/${id}`;

  const res = await fetch(apiURL, {
    method: 'DELETE',
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  if (res.ok) {
    revalidatePath('/seo-analysis/all');
    redirect(`/seo-analysis/all?success=true`);
  } else {
    console.error(res);
    redirect('/seo-analysis/all?error=true');
  }
}

export async function deleteSelectedKeywordAnalysisAction(ids: number[]) {
  let success = false;

  try {
    for (const id of ids) {
      const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser/${id}`;

      const res = await fetch(apiURL, {
        method: 'DELETE',
        headers: {
          'X-API-Key': process.env.INTERNAL_API_KEY!,
        },
      });

      if (!res.ok) {
        console.error(res);
      }
    }
    success = true;
  } catch (error) {
    console.error(error);
  }

  if (success) {
    revalidatePath('/seo-analysis/all');
    redirect(`/seo-analysis/all?success=true`);
  } else {
    redirect('/seo-analysis/all?error=true');
  }
}
