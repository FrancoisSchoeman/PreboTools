import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

import { columns } from './columns';
import { DataTable } from '@/components/DataTable';
import CopyButton from '../_components/CopyButton';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
  deleteSelectedFeedsAction,
  deleteFeedAction,
} from '@/actions/feedOptimiser';
import type { FeedResults } from '@/lib/types';
import DeleteFeedButton from '../_components/DeleteFeedButton';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type Params = Promise<{ id: string }>;

export default async function FeedPage(props: {
  searchParams: SearchParams;
  params: Params;
}) {
  const { id } = await props.params;
  const { success } = await props.searchParams;

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

  const formattedCreatedDate = format(
    new Date(data.feed.date_created),
    'dd/MM/yyyy'
  );
  const formattedModifiedDate = format(
    new Date(data.feed.date_modified),
    'dd/MM/yyyy'
  );

  const productsWithFeedId = data.products.map((product) => ({
    ...product,
    feed_id: data.feed.id,
  }));

  return (
    <div className="mb-8 md:my-8">
      <Card className="max-w-sm ml-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{data.feed.name}</CardTitle>
          <CardDescription className="text-lg">
            <div className="flex justify-between items-center">
              <span>Details</span>
              <div className="flex justify-between items-center gap-1">
                <CopyButton data={`${process.env.BASE_URL}/api/feeds/${id}`}>
                  Copy the feed URL to your clipboard.
                </CopyButton>
                <DeleteFeedButton action={deleteFeedAction} id={data.feed.id} />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base py-1">
            ID:{' '}
            <span className="text-neutral-500 dark:text-neutral-400">
              {data.feed.id}
            </span>
          </p>
          <Separator />
          <p className="text-base py-1">
            Feed Type:{' '}
            <span className="text-neutral-500 dark:text-neutral-400">
              {data.feed.feed_type}
            </span>
          </p>
          <Separator />
          <p className="text-base py-1">
            File Format:{' '}
            <span className="text-neutral-500 dark:text-neutral-400">
              {data.feed.file_format}
            </span>
          </p>
          <Separator />
          <p className="text-base py-1">
            Date Created:{' '}
            <span className="text-neutral-500 dark:text-neutral-400">
              {formattedCreatedDate}
            </span>
          </p>
          <Separator />
          <p className="text-base py-1">
            Date Modified:{' '}
            <span className="text-neutral-500 dark:text-neutral-400">
              {formattedModifiedDate}
            </span>
          </p>
          <Separator />
          <Link
            href={data.feed.url}
            target="_blank"
            className="hover:underline transition-all"
          >
            Original Feed URL
          </Link>
        </CardContent>
      </Card>

      <div className="overflow-x-auto container mx-auto">
        <DataTable
          columns={columns}
          data={productsWithFeedId}
          success={success === 'true'}
          showToast={success !== undefined}
          filterColumn="title"
          action={deleteSelectedFeedsAction}
        />
      </div>
    </div>
  );
}
