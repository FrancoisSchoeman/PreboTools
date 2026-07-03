import { notFound } from 'next/navigation';

import { deleteClientAction, updateClientAction } from '@/actions/leadGen';
import SubmitButton from '@/components/SubmitButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormCheckbox from '../../../_components/FormCheckbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail } from '@/lib/types';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function ClientSettingsPage(props: {
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
  const deleteAction = deleteClientAction.bind(null, clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Edit client details and status.</p>
      </div>

      {success === 'true' && (
        <p className="text-sm text-green-600">Settings saved.</p>
      )}
      {error === 'true' && (
        <p className="text-sm text-red-600">Failed to save settings.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                defaultValue={client.company_name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                defaultValue={client.website_url}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={client.contact_email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={client.timezone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                name="internal_notes"
                defaultValue={client.internal_notes}
              />
            </div>
            <FormCheckbox
              id="is_active"
              name="is_active"
              defaultChecked={client.is_active}
              label="Client active"
            />
            <FormCheckbox
              id="auto_email_enabled"
              name="auto_email_enabled"
              defaultChecked={client.auto_email_enabled}
              label="Send email notifications automatically"
              description="When off, form submissions are still received and visible in the dashboard, but no notification email is sent."
            />
            <SubmitButton submitText="Saving">Save Changes</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this client and all submissions. This cannot be
            undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Client</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {client.company_name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the client and all form
                  submissions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={deleteAction}>
                  <AlertDialogAction type="submit" className="bg-red-600">
                    Delete
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
