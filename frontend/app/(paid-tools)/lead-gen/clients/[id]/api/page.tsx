import Link from 'next/link';
import { notFound } from 'next/navigation';

import CopyField from '../../../_components/CopyField';
import RegenerateKeyButton from '../../../_components/RegenerateKeyButton';
import TestEndpointButton from '../../../_components/TestEndpointButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail } from '@/lib/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ success?: string; test?: string }>;

const examplePayload = `{
  "email": "lead@example.com",
  "phone": "+27123456789",
  "first_name": "Jane",
  "last_name": "Doe",
  "gclid": "EAIaIQobChMI...",
  "landing_page": "https://example.com/contact"
}`;

export default async function ClientApiPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { success, test } = await props.searchParams;
  const clientId = Number(id);

  let client: LeadGenClientDetail;

  try {
    client = await leadGenFetch<LeadGenClientDetail>(`/clients/${clientId}`);
  } catch {
    notFound();
  }

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
            href="/apiDevelopmentDocs/landingPageIntegration.md"
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
