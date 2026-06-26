import { notFound } from 'next/navigation';

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
    <div className="space-y-4">
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
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
