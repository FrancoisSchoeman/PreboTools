'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function optimiseFeedImportAction(formData: FormData) {
  let data;

  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/create/import`;

  const feedName = formData.get('feed-name') as string;
  const feedUrl = formData.get('feed-url') as string;
  const feedType = formData.get('feed-type') as string;
  const fileFormat = formData.get('file-format') as string;

  const res = await fetch(apiURL, {
    method: 'POST',
    body: JSON.stringify({
      name: feedName,
      url: feedUrl,
      feed_type: feedType,
      file_format: fileFormat,
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

  if (data.feed) {
    revalidatePath(`/feed-optimiser/${data.feed.id}`);
    redirect(`/feed-optimiser/${data.feed.id}?success=true`);
  } else {
    const error = await res.text();
    console.error(error);
    redirect('/feed-optimiser?error=true');
  }
}

export async function optimiseFeedUploadAction(formData: FormData) {
  let data;

  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/create/upload`;

  const feedName = formData.get('feed-name') as string;
  const feedFile = formData.get('feed-file') as File;
  const limitProducts = formData.get('limit-products') as string;

  const newFormData = new FormData();
  newFormData.append('name', feedName);
  newFormData.append(
    'limited_products_import',
    limitProducts === 'on' ? 'True' : 'False'
  );
  newFormData.append('file', feedFile);

  const res = await fetch(apiURL, {
    method: 'POST',
    body: newFormData,
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
  }

  if (data.feed) {
    revalidatePath(`/feed-optimiser/${data.feed.id}`);
    redirect(`/feed-optimiser/${data.feed.id}?success=true`);
  } else {
    console.error(res);
    redirect('/feed-optimiser?error=true');
  }
}

export async function deleteFeedAction(id: number) {
  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/${id}`;

  const res = await fetch(apiURL, {
    method: 'DELETE',
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  if (res.ok) {
    revalidatePath('/feed-optimiser/all');
    redirect('/feed-optimiser/all?success=true');
  } else {
    console.error(res);
    redirect('/feed-optimiser/all?error=true');
  }
}

export async function deleteSelectedFeedsAction(ids: number[]) {
  let success = false;

  try {
    for (const id of ids) {
      const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/${id}`;
      await fetch(apiURL, {
        method: 'DELETE',
        headers: {
          'X-API-Key': process.env.INTERNAL_API_KEY!,
        },
      });
    }
    success = true;
  } catch (error) {
    console.error(error);
  }

  if (success) {
    revalidatePath('/feed-optimiser/all');
    redirect(`/feed-optimiser/all?success=true`);
  } else {
    redirect('/feed-optimiser/all?error=true');
  }
}

export async function refreshProductAction(formData: FormData) {
  let data;

  const feed_id = Number(formData.get('feed_id'));
  const product_id = Number(formData.get('product_id'));

  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/${feed_id}/refresh/${product_id}`;

  const res = await fetch(apiURL, {
    method: 'PUT',
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
  }

  if (data.feed) {
    revalidatePath(`/feed-optimiser/${data.feed.id}`);
    redirect(`/feed-optimiser/${data.feed.id}?success=true`);
  } else {
    console.error(res);
    redirect(`/feed-optimiser/${data.feed.id}?error=true`);
  }
}
