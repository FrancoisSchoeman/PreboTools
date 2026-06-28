import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateSubmissionAction } from '@/actions/leadGen';
import SubmitButton from '@/components/SubmitButton';
import ResendEmailButton from '../../../../_components/ResendEmailButton';
import LeadScoreBadge from '../../../../_components/LeadScoreBadge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenSubmissionDetail } from '@/lib/types';

type Params = Promise<{ id: string; submissionId: string }>;
type SearchParams = Promise<{ success?: string; error?: string; resent?: string }>;

export default async function SubmissionDetailPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id, submissionId } = await props.params;
  const { success, error, resent } = await props.searchParams;
  const clientId = Number(id);
  const subId = Number(submissionId);

  let submission: LeadGenSubmissionDetail;

  try {
    submission = await leadGenFetch<LeadGenSubmissionDetail>(
      `/clients/${clientId}/submissions/${subId}`
    );
  } catch {
    notFound();
  }

  const updateAction = updateSubmissionAction.bind(null, clientId, subId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/lead-gen/clients/${clientId}/submissions`}>
            Back to submissions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Submission #{submission.id}</h1>
      </div>

      {success === 'true' && (
        <p className="text-sm text-green-600">Submission updated.</p>
      )}
      {error === 'true' && (
        <p className="text-sm text-red-600">Failed to update submission.</p>
      )}
      {resent === 'success' && (
        <p className="text-sm text-green-600">Notification email resent successfully.</p>
      )}
      {resent === 'error' && (
        <p className="text-sm text-red-600">Failed to resend notification email.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span>{' '}
              {submission.email || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{' '}
              {submission.phone || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Name:</span>{' '}
              {[submission.first_name, submission.last_name]
                .filter(Boolean)
                .join(' ') || '—'}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Lead score:</span>{' '}
              <LeadScoreBadge score={submission.lead_score} />
            </p>
            <p>
              <span className="text-muted-foreground">Submitted:</span>{' '}
              {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm')}
            </p>
            <p>
              <span className="text-muted-foreground">Landing page:</span>{' '}
              {submission.landing_page || '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-mono">
            <p>GCLID: {submission.gclid || '—'}</p>
            <p>GBRAID: {submission.gbraid || '—'}</p>
            <p>WBRAID: {submission.wbraid || '—'}</p>
            <p>UTM Source: {submission.utm_source || '—'}</p>
            <p>UTM Medium: {submission.utm_medium || '—'}</p>
            <p>UTM Campaign: {submission.utm_campaign || '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            <span className="text-muted-foreground">Sent to:</span>{' '}
            {submission.notification_email}
          </p>
          <Badge variant={submission.email_sent ? 'default' : 'destructive'}>
            {submission.email_sent ? 'Sent' : 'Failed'}
          </Badge>
          {submission.email_sent_at && (
            <p className="text-sm text-muted-foreground">
              Sent {format(new Date(submission.email_sent_at), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
          {submission.email_error && (
            <p className="text-sm text-red-600">{submission.email_error}</p>
          )}
          <ResendEmailButton clientId={clientId} submissionId={subId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="lead_status">Lead Status</Label>
              <Input
                id="lead_status"
                name="lead_status"
                defaultValue={submission.lead_status}
              />
            </div>
            <SubmitButton submitText="Saving">Save Changes</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="raw">
          <AccordionTrigger>Raw Payload</AccordionTrigger>
          <AccordionContent>
            <pre className="text-xs overflow-auto rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4">
              {JSON.stringify(submission.raw_payload, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const dynamic = 'force-dynamic';
