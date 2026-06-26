import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateClientAction } from '@/actions/leadGen';
import CopyField from '../../../_components/CopyField';
import SubmitButton from '@/components/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormCheckbox from '../../../_components/FormCheckbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail } from '@/lib/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ success?: string; error?: string }>;

const csvColumns = [
  { column: 'Google Click ID', field: 'gclid' },
  { column: 'Conversion Name', field: 'conversion_name' },
  { column: 'Conversion Time', field: 'conversion_time' },
  { column: 'Conversion Value', field: 'conversion_value' },
  { column: 'Conversion Currency', field: 'conversion_currency' },
  { column: 'Email', field: 'email (hashed)' },
  { column: 'Phone', field: 'phone (hashed)' },
];

export default async function GoogleOfflinePage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { success, error } = await props.searchParams;
  const clientId = Number(id);

  let client: LeadGenClientDetail;

  try {
    client = await leadGenFetch<LeadGenClientDetail>(`/clients/${clientId}`);
  } catch {
    notFound();
  }

  const updateAction = updateClientAction.bind(null, clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Offline Imports</h1>
        <p className="text-muted-foreground">
          Configure offline conversion settings and CSV export.
        </p>
      </div>

      {success === 'true' && (
        <p className="text-sm text-green-600">Settings saved.</p>
      )}
      {error === 'true' && (
        <p className="text-sm text-red-600">Failed to save settings.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Conversion Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-4 max-w-lg">
            <input type="hidden" name="return_to" value={`/lead-gen/clients/${clientId}/google?success=true`} />
            <FormCheckbox
              id="google_offline_enabled"
              name="google_offline_enabled"
              defaultChecked={client.google_offline_enabled}
              label="Enable Google Ads Offline Conversion Imports"
            />
            <div className="space-y-2">
              <Label htmlFor="conversion_name">Conversion Name</Label>
              <Input
                id="conversion_name"
                name="conversion_name"
                defaultValue={client.conversion_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversion_action_id">Conversion Action ID</Label>
              <Input
                id="conversion_action_id"
                name="conversion_action_id"
                defaultValue={client.conversion_action_id}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={client.currency || 'ZAR'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_conversion_value">
                Default Conversion Value
              </Label>
              <Input
                id="default_conversion_value"
                name="default_conversion_value"
                type="number"
                step="0.01"
                defaultValue={client.default_conversion_value ?? ''}
              />
            </div>
            <SubmitButton submitText="Saving">Save Settings</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.google_offline_enabled ? (
            <>
              <CopyField label="CSV Feed URL" value={client.csv_endpoint} />
              <a
                href={client.csv_endpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Download CSV
              </a>
            </>
          ) : (
            <Badge variant="secondary">Enable offline conversions to use CSV feed</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Import Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>In Google Ads, go to Goals → Conversions → Uploads.</li>
            <li>Create or select an offline conversion action.</li>
            <li>Upload the CSV from the feed URL on a schedule (daily recommended).</li>
            <li>
              Google uses Order ID (submission UUID) to help prevent duplicate
              conversions on repeat imports.
            </li>
          </ol>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CSV Column</TableHead>
                <TableHead>Source Field</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvColumns.map((row) => (
                <TableRow key={row.column}>
                  <TableCell>{row.column}</TableCell>
                  <TableCell className="font-mono text-xs">{row.field}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Link
            href="https://developers.google.com/google-ads/api/docs/conversions/upload-offline"
            className="text-blue-600 hover:underline"
          >
            View integration documentation
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
