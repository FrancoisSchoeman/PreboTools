'use server';

// TODO: Implement the optimiseFeedImportAction function
export async function optimiseFeedImportAction(formData: FormData) {
  const feedName = formData.get('feed-name') as string;
  const feedUrl = formData.get('feed-url') as string;
  const feedType = formData.get('feed-type') as string;
  const fileFormat = formData.get('file-format') as string;

  console.log(feedName, feedUrl, feedType, fileFormat);
}

// TODO: Implement the optimiseFeedUploadAction function
export async function optimiseFeedUploadAction(formData: FormData) {
  const feedName = formData.get('feed-name') as string;
  const feedFile = formData.get('feed-file') as File;

  console.log(feedName, feedFile);
}
