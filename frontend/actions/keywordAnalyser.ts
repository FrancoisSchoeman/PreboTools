'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function analyseKeywordAction(formData: FormData) {
  let data;

  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser`;

  const location = formData.get('keyword-location') as string;
  const locale = formData.get('keyword-locale') as string;
  const keywordUrl = formData.get('keyword-url') as string;
  const rawKeywords = formData.get('keyword-keywords') as string;
  const keywords = rawKeywords.split(/\r?\n/);

  console.log(keywords);

  const res = await fetch(apiURL, {
    method: 'POST',
    body: JSON.stringify({
      location,
      locale,
      url: keywordUrl,
      keywords,
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
  }

  if (data.results) {
    redirect(`/seo-analysis/${data.feed.id}?success=true`);
  } else {
    const error = await res.text();
    console.error(error);
    redirect('/seo-analysis?error=true');
  }
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
