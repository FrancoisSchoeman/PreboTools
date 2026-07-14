import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateClientAction } from '@/actions/leadGen';
import CopyField from '../../../_components/CopyField';
import FormCheckbox from '../../../_components/FormCheckbox';
import RegenerateKeyButton from '../../../_components/RegenerateKeyButton';
import SubmitButton from '@/components/SubmitButton';
import TestEndpointButton from '../../../_components/TestEndpointButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail } from '@/lib/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
  success?: string;
  test?: string;
  csv?: string;
  error?: string;
}>;

const examplePayload = `{
  "email": "lead@example.com",
  "phone": "+27123456789",
  "first_name": "Jane",
  "last_name": "Doe",
  "gclid": "EAIaIQobChMI...",
  "landing_page": "https://example.com/contact"
}`;

const appScriptExample = `const url = 'https://tools.prebodigital.co.za/api/leads/{API_KEY}/submissions.csv';
const since = PropertiesService.getScriptProperties().getProperty('lastPull');
const fetchUrl = since ? \`\${url}?since=\${encodeURIComponent(since)}\` : url;
const csv = UrlFetchApp.fetch(fetchUrl).getContentText();
// parse CSV, append rows to sheet, store new lastPull timestamp`;

export default async function ClientApiPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { success, test, csv, error } = await props.searchParams;
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
        <h1 className="text-3xl font-bold">API</h1>
        <p className="text-muted-foreground">
          Form submission endpoint and API key management.
        </p>
      </div>

      {success === 'true' && (
        <p className="text-sm text-green-600">API key regenerated successfully.</p>
      )}
      {test === 'success' && (
        <p className="text-sm text-green-600">Test submission sent successfully.</p>
      )}
      {test === 'error' && (
        <p className="text-sm text-red-600">Test submission failed.</p>
      )}
      {csv === 'success' && (
        <p className="text-sm text-green-600">Leads CSV settings saved.</p>
      )}
      {csv === 'error' && (
        <p className="text-sm text-red-600">Failed to save leads CSV settings.</p>
      )}
      {error === 'true' && (
        <p className="text-sm text-red-600">Failed to save settings.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Form Submission Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyField label="POST URL" value={client.form_endpoint} />
          <div className="space-y-2">
            <p className="text-sm font-medium">Example JSON payload</p>
            <pre className="text-xs overflow-auto rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4">
              {examplePayload}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads CSV Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export form submissions as plain-text CSV (unhashed email, phone, and
            names). Intended for Google Sheets App Script or similar scheduled
            integrations.
          </p>
          <form action={updateAction} className="space-y-4">
            <input
              type="hidden"
              name="return_to"
              value={`/lead-gen/clients/${clientId}/api?csv=success`}
            />
            <FormCheckbox
              id="leads_csv_enabled"
              name="leads_csv_enabled"
              defaultChecked={client.leads_csv_enabled}
              label="Enable leads CSV export"
              description="When off, the CSV URL returns 404. Exposes unhashed contact details."
            />
            <SubmitButton submitText="Saving">Save CSV Settings</SubmitButton>
          </form>
          {client.leads_csv_enabled ? (
            <>
              <CopyField label="CSV Feed URL" value={client.leads_csv_endpoint} />
              <p className="text-sm text-muted-foreground">
                Append <code className="text-xs">?since=2026-07-01T00:00:00Z</code>{' '}
                (ISO 8601) to fetch only submissions received on or after that
                timestamp.
              </p>
              <a
                href={client.leads_csv_endpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Download CSV
              </a>
              <div className="space-y-2">
                <p className="text-sm font-medium">Google Sheets App Script example</p>
                <pre className="text-xs overflow-auto rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4">
                  {appScriptExample}
                </pre>
              </div>
            </>
          ) : (
            <Badge variant="secondary">Enable leads CSV export to use the feed URL</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyField label="API Key" value={client.api_key} masked />
          <div className="flex flex-wrap gap-2">
            <TestEndpointButton clientId={clientId} />
            <RegenerateKeyButton clientId={clientId} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Landing pages POST form data to the endpoint above. PreboTools sends
            notification emails and stores leads for Google offline conversion export.
          </p>
          <Link
            href="/lead-gen/docs/landing-page-integration"
            className="text-blue-600 hover:underline"
          >
            Landing page integration guide
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
