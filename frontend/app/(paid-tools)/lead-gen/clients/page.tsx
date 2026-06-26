import Link from 'next/link';

import { deleteSelectedClientsAction } from '@/actions/leadGen';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClient } from '@/lib/types';
import { columns } from './columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LeadGenClientsPage(props: {
  searchParams: SearchParams;
}) {
  const { success } = await props.searchParams;
  let clients: LeadGenClient[] = [];

  try {
    clients = await leadGenFetch<LeadGenClient[]>('/clients');
  } catch {
    clients = [];
  }

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lead Gen Clients</h1>
          <p className="text-muted-foreground">
            Manage client landing page integrations and lead capture.
          </p>
        </div>
        <Button asChild>
          <Link href="/lead-gen/clients/new">Add Client</Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        success={success === 'true'}
        showToast={success !== undefined}
        filterColumn="company_name"
        action={deleteSelectedClientsAction}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
