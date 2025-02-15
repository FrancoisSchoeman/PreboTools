import { notFound } from 'next/navigation';
import type { FeedResults } from '@/lib/types';

import FeedProducts from '../_components/FeedProducts';
import CopyButton from '../_components/CopyButton';

interface FeedPageProps {
  params: {
    id: string;
  };
  searchParams: {
    success: string;
    error: string;
  };
}

export default async function FeedPage({
  params,
  searchParams,
}: FeedPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;

  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/`;

  const res = await fetch(`${apiURL}${id}`, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });
  const data: FeedResults = await res.json();

  if (!data.feed) {
    notFound();
  }

  return (
    <div>
      <div>
        <CopyButton
          data={`${process.env.BACKEND_URL}/api/feed-optimiser/${id}/csv`}
        >
          Copy Feed URL
        </CopyButton>
        <h1>{data.feed.name}</h1>
        <p>{data.feed.feed_type}</p>
        <p>{data.feed.file_format}</p>
        <p>{data.feed.date_created}</p>
        <p>{data.feed.date_modified}</p>
        <p>{data.feed.url}</p>
      </div>
      <FeedProducts data={data.products} success={success} error={error} />
    </div>
  );
}
