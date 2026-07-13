import { notFound } from 'next/navigation';

import { deleteSelectedSubmissionsAction } from '@/actions/leadGen';
import { DataTable } from '@/components/DataTable';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenSubmission } from '@/lib/types';
import { columns } from './columns';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ success?: string }>;

export default async function SubmissionsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { success } = await props.searchParams;
  const clientId = Number(id);

  let submissions: LeadGenSubmission[] = [];

  try {
    submissions = await leadGenFetch<LeadGenSubmission[]>(
      `/clients/${clientId}/submissions`
    );
  } catch {
    notFound();
  }

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Form Submissions</h1>
        <p className="text-muted-foreground">
          Leads captured from client landing pages.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        success={success === 'true'}
        showToast={success !== undefined}
        filterColumn="email"
        action={deleteSelectedSubmissionsAction.bind(null, clientId)}
        enumFilter={{
          column: 'lead_score',
          label: 'Lead score',
          options: [
            { label: 'Not set', value: 'not_set' },
            { label: 'Cold', value: 'cold' },
            { label: 'Warm', value: 'warm' },
            { label: 'Hot', value: 'hot' },
          ],
        }}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
