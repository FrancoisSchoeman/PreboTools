import Link from 'next/link';
import { notFound } from 'next/navigation';

import TestSmtpButton from '../../../_components/TestSmtpButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail, LeadGenSmtpServer } from '@/lib/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ test?: string }>;

const comingSoonProviders = [
  'Microsoft 365',
  'Gmail OAuth',
  'Amazon SES',
  'SendGrid',
  'Mailgun',
  'Client SMTP',
];

export default async function ClientSmtpPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { test } = await props.searchParams;
  const clientId = Number(id);

  let client: LeadGenClientDetail;
  let smtpServers: LeadGenSmtpServer[] = [];

  try {
    client = await leadGenFetch<LeadGenClientDetail>(`/clients/${clientId}`);
    smtpServers = await leadGenFetch<LeadGenSmtpServer[]>('/smtp-servers');
  } catch {
    notFound();
  }

  const preboSmtp = smtpServers[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SMTP</h1>
        <p className="text-muted-foreground">
          Email delivery configuration for {client.company_name}.
        </p>
      </div>

      {test === 'success' && (
        <p className="text-sm text-green-600">SMTP test email sent successfully.</p>
      )}
      {test === 'error' && (
        <p className="text-sm text-red-600">SMTP test failed.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>Prebo SMTP</Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Lead notification emails are sent via the shared Prebo SMTP server.
          </p>
        </CardContent>
      </Card>

      {preboSmtp && (
        <Card>
          <CardHeader>
            <CardTitle>{preboSmtp.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Host: {preboSmtp.host}</p>
            <p>From: {preboSmtp.from_email}</p>
            <p>
              Status:{' '}
              {preboSmtp.status_ok ? 'Connected' : preboSmtp.status_detail}
            </p>
            <TestSmtpButton clientId={clientId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Other Providers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {comingSoonProviders.map((provider) => (
            <Badge key={provider} variant="secondary">
              {provider} — Coming Soon
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/lead-gen/smtp">Manage SMTP Servers</Link>
      </Button>
    </div>
  );
}

export const dynamic = 'force-dynamic';
