'use server';
import { redirect } from 'next/navigation';

export async function optimiseFeedImportAction(formData: FormData) {
  let success = false;
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
    success = true;
    redirect(`/feed-optimiser/${data.feed.id}?success=true`);
  } else {
    const error = await res.text();
    console.error(error);
    redirect('/feed-optimiser?error=true');
  }
}

// TODO: Implement the optimiseFeedUploadAction function
export async function optimiseFeedUploadAction(formData: FormData) {
  let success = false;
  let data;

  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/create/upload`;

  const feedName = formData.get('feed-name') as string;
  const feedFile = formData.get('feed-file') as File;

  const newFormData = new FormData();
  newFormData.append('name', feedName); // Adjust the key as required by your API
  newFormData.append('limited_products_import', 'True'); // Adjust the key as required by your API
  newFormData.append('file', feedFile); // Adjust the key as required by your API

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
    success = true;
    redirect(`/feed-optimiser/${data.feed.id}?success=true`);
  } else {
    console.error(res);
    redirect('/feed-optimiser?error=true');
  }
}
