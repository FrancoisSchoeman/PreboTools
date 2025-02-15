import type { Feed } from '@/lib/types';
import { notFound } from 'next/navigation';

export default async function AllFeedsPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/feed-optimiser/`;

  const res = await fetch(`${apiURL}all`, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });
  const data: Feed[] = await res.json();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1>All Feeds</h1>
      <ul>
        {data.map((feed) => (
          <li key={feed.id}>
            <a href={`/feed-optimiser/${feed.id}`}>{feed.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
