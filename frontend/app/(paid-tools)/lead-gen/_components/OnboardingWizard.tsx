import Link from 'next/link';

import { createClientAction, completeOnboardingAction } from '@/actions/leadGen';
import { advanceWizardStepAction } from '@/actions/leadGen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SubmitButton from '@/components/SubmitButton';
import CopyField from './CopyField';
import FormCheckbox from './FormCheckbox';
import HealthCheckList from './HealthCheckList';
import TestEndpointButton from './TestEndpointButton';
import TestSmtpButton from './TestSmtpButton';
import { LeadGenClientDetail, LeadGenHealthCheck, LeadGenSmtpServer } from '@/lib/types';

const comingSoonProviders = [
  'Microsoft 365',
  'Gmail OAuth',
  'Amazon SES',
  'SendGrid',
  'Mailgun',
];

export default function OnboardingWizard({
  step,
  clientId,
  client,
  smtpServers,
  healthChecks,
}: {
  step: number;
  clientId?: number;
  client?: LeadGenClientDetail;
  smtpServers?: LeadGenSmtpServer[];
  healthChecks?: LeadGenHealthCheck[];
}) {
  const preboSmtp = smtpServers?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Lead Gen Client</h1>
        <p className="text-muted-foreground">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createClientAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input id="company_name" name="company_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input id="website_url" name="website_url" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue="Africa/Johannesburg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea id="internal_notes" name="internal_notes" />
              </div>
              <SubmitButton submitText="Creating">Continue</SubmitButton>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && clientId && (
        <Card>
          <CardHeader>
            <CardTitle>Email Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="font-medium">Email Provider</p>
              <div className="flex flex-wrap gap-2">
                <Badge>SMTP</Badge>
                {comingSoonProviders.map((provider) => (
                  <Badge key={provider} variant="secondary">
                    {provider} — Coming Soon
                  </Badge>
                ))}
              </div>
            </div>

            {preboSmtp && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">{preboSmtp.name}</p>
                <p className="text-sm text-muted-foreground">
                  Host: {preboSmtp.host}
                </p>
                <p className="text-sm text-muted-foreground">
                  From: {preboSmtp.from_email}
                </p>
                <p className="text-sm">
                  Status: {preboSmtp.status_ok ? 'Connected' : preboSmtp.status_detail}
                </p>
                <TestSmtpButton clientId={clientId} />
              </div>
            )}

            <div className="flex gap-2">
              <form action={advanceWizardStepAction.bind(null, clientId, 3)}>
                <SubmitButton submitText="Continuing">Continue</SubmitButton>
              </form>
              <Button variant="outline" asChild>
                <Link href="/lead-gen/smtp">Manage SMTP Servers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && clientId && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={completeOnboardingAction.bind(null, clientId)} className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium">Form Collection</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>

              <div className="rounded-lg border p-4">
                <FormCheckbox
                  id="google_offline_enabled"
                  name="google_offline_enabled"
                  label="Google Ads Offline Conversion Imports"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversion_name">Conversion Name</Label>
                <Input id="conversion_name" name="conversion_name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversion_action_id">Conversion Action ID</Label>
                <Input id="conversion_action_id" name="conversion_action_id" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="ZAR" />
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
                />
              </div>

              <SubmitButton submitText="Saving">Continue</SubmitButton>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 4 && client && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyField label="Form Submission Endpoint" value={client.form_endpoint} />
              <CopyField label="Google CSV Feed URL" value={client.csv_endpoint} />
              <CopyField label="API Key" value={client.api_key} masked />
              <TestEndpointButton clientId={client.id} />
              <Button asChild>
                <Link href={`/lead-gen/clients/${client.id}`}>Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          {healthChecks && (
            <Card>
              <CardHeader>
                <CardTitle>Health Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <HealthCheckList checks={healthChecks} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
