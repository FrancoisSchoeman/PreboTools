import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';

import ClientStatusBadge from '../../_components/ClientStatusBadge';
import HealthCheckList from '../../_components/HealthCheckList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leadGenFetch } from '@/lib/leadGenApi';
import {
  LeadGenClientDetail,
  LeadGenHealthCheck,
  LeadGenStats,
} from '@/lib/types';

type Params = Promise<{ id: string }>;

export default async function ClientDashboardPage(props: { params: Params }) {
  const { id } = await props.params;

  let client: LeadGenClientDetail;
  let stats: LeadGenStats;
  let health: LeadGenHealthCheck[] = [];

  try {
    client = await leadGenFetch<LeadGenClientDetail>(`/clients/${id}`);
    stats = await leadGenFetch<LeadGenStats>(`/clients/${id}/stats`);
    const healthData = await leadGenFetch<{ checks: LeadGenHealthCheck[] }>(
      `/clients/${id}/health`
    );
    health = healthData.checks;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{client.company_name}</h1>
        <ClientStatusBadge active={client.is_active} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today&apos;s Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todays_leads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_leads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">SMTP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Prebo SMTP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Offline Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {client.google_offline_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Last submission:{' '}
              {stats.last_submission_at
                ? formatDistanceToNow(new Date(stats.last_submission_at), {
                    addSuffix: true,
                  })
                : 'None yet'}
            </p>
            <p>
              Last CSV export:{' '}
              {stats.last_csv_export_at
                ? formatDistanceToNow(new Date(stats.last_csv_export_at), {
                    addSuffix: true,
                  })
                : 'None yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCheckList checks={health} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
