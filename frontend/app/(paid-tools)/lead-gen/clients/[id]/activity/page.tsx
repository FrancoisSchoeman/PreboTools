import { notFound } from 'next/navigation';

import { DataTable } from '@/components/DataTable';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenActivity } from '@/lib/types';
import { activityColumns } from './columns';

type Params = Promise<{ id: string }>;

export default async function ActivityPage(props: { params: Params }) {
  const { id } = await props.params;
  const clientId = Number(id);

  let activity: LeadGenActivity[] = [];

  try {
    activity = await leadGenFetch<LeadGenActivity[]>(
      `/clients/${clientId}/activity`
    );
  } catch {
    notFound();
  }

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Recent events for this client (newest first).
        </p>
      </div>

      <DataTable
        columns={activityColumns}
        data={activity}
        filterColumn="message"
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
