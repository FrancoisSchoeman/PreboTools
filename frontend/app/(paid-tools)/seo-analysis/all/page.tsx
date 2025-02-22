import type { KeywordAnalysis } from '@/lib/types';
import { notFound } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { columns } from './columns';

import { deleteSelectedKeywordAnalysisAction } from '@/actions/keywordAnalyser';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AllAnalysedKeywordsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { success } = searchParams;

  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser/`;

  const res = await fetch(`${apiURL}all`, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  let data: KeywordAnalysis[];
  try {
    data = await res.json();
  } catch (e) {
    data = [];
    console.log(e);
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50">
      <h1 className="text-3xl">All Analysed Keywords</h1>
      <div className="overflow-x-auto container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          success={success === 'true'}
          showToast={success !== undefined}
          filterColumn="mapped_keyword"
          action={deleteSelectedKeywordAnalysisAction}
        />
      </div>
    </div>
  );
}
