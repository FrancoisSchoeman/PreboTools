'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { leadGenMutate } from '@/lib/leadGenApi';

function revalidateLeadGen(clientId?: number, submissionId?: number) {
  revalidatePath('/lead-gen/clients');
  if (clientId) {
    revalidatePath(`/lead-gen/clients/${clientId}`);
    revalidatePath(`/lead-gen/clients/${clientId}/submissions`);
    if (submissionId) {
      revalidatePath(
        `/lead-gen/clients/${clientId}/submissions/${submissionId}`
      );
    }
    revalidatePath(`/lead-gen/clients/${clientId}/activity`);
    revalidatePath(`/lead-gen/clients/${clientId}/api`);
    revalidatePath(`/lead-gen/clients/${clientId}/google`);
    revalidatePath(`/lead-gen/clients/${clientId}/settings`);
  }
}

export async function createClientAction(formData: FormData) {
  const payload = {
    company_name: formData.get('company_name')?.toString() || '',
    contact_email: formData.get('contact_email')?.toString() || '',
    website_url: formData.get('website_url')?.toString() || '',
    timezone: formData.get('timezone')?.toString() || 'Africa/Johannesburg',
    internal_notes: formData.get('internal_notes')?.toString() || '',
    is_active: true,
  };

  let clientId: number;

  try {
    const data = await leadGenMutate<{ id: number }>('/clients', 'POST', payload);
    clientId = data.id;
    revalidateLeadGen(clientId);
  } catch {
    redirect('/lead-gen/clients/new?error=true');
  }

  redirect(`/lead-gen/clients/new?clientId=${clientId}&step=2`);
}

export async function updateClientAction(clientId: number, formData: FormData) {
  const payload: Record<string, unknown> = {};

  const fields = [
    'company_name',
    'contact_email',
    'website_url',
    'timezone',
    'internal_notes',
    'conversion_name',
    'conversion_action_id',
    'currency',
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) payload[field] = value.toString();
  }

  const defaultValue = formData.get('default_conversion_value')?.toString();
  if (defaultValue) payload.default_conversion_value = defaultValue;

  if (formData.has('is_active_present')) {
    payload.is_active = formData.get('is_active') === 'on';
  }
  if (formData.has('auto_email_enabled_present')) {
    payload.auto_email_enabled = formData.get('auto_email_enabled') === 'on';
  }
  if (formData.has('google_offline_enabled_present')) {
    payload.google_offline_enabled =
      formData.get('google_offline_enabled') === 'on';
  }
  if (formData.has('leads_csv_enabled_present')) {
    payload.leads_csv_enabled = formData.get('leads_csv_enabled') === 'on';
  }

  const returnTo = formData.get('return_to')?.toString();

  try {
    await leadGenMutate(`/clients/${clientId}`, 'PATCH', payload);
    revalidateLeadGen(clientId);
  } catch {
    if (returnTo) {
      redirect(`${returnTo.split('?')[0]}?error=true`);
    }
    redirect(`/lead-gen/clients/${clientId}/settings?error=true`);
  }

  if (returnTo) redirect(returnTo);
  redirect(`/lead-gen/clients/${clientId}/settings?success=true`);
}

export async function completeOnboardingAction(clientId: number, formData: FormData) {
  const payload = {
    google_offline_enabled: formData.get('google_offline_enabled') === 'on',
    conversion_name: formData.get('conversion_name')?.toString() || '',
    conversion_action_id: formData.get('conversion_action_id')?.toString() || '',
    currency: formData.get('currency')?.toString() || 'ZAR',
    default_conversion_value:
      formData.get('default_conversion_value')?.toString() || null,
  };

  try {
    await leadGenMutate(`/clients/${clientId}`, 'PATCH', payload);
    revalidateLeadGen(clientId);
  } catch {
    redirect(`/lead-gen/clients/new?clientId=${clientId}&step=3&error=true`);
  }

  redirect(`/lead-gen/clients/new?clientId=${clientId}&step=4`);
}

export async function deleteClientAction(id: number) {
  try {
    await leadGenMutate(`/clients/${id}`, 'DELETE');
    revalidatePath('/lead-gen/clients');
  } catch {
    redirect('/lead-gen/clients?error=true');
  }

  redirect('/lead-gen/clients?success=true');
}

export async function deleteSelectedClientsAction(ids: number[]) {
  for (const id of ids) {
    try {
      await leadGenMutate(`/clients/${id}`, 'DELETE');
    } catch (error) {
      console.error(error);
    }
  }
  revalidatePath('/lead-gen/clients');
  redirect('/lead-gen/clients?success=true');
}

export async function regenerateApiKeyAction(clientId: number) {
  try {
    await leadGenMutate(`/clients/${clientId}/regenerate-key`, 'POST');
    revalidateLeadGen(clientId);
  } catch {
    redirect(`/lead-gen/clients/${clientId}/api?error=true`);
  }

  redirect(`/lead-gen/clients/${clientId}/api?success=true`);
}

export async function testEndpointAction(clientId: number) {
  let testResult: 'success' | 'error' = 'error';

  try {
    const data = await leadGenMutate<{ success: boolean; message: string }>(
      `/clients/${clientId}/test-endpoint`,
      'POST'
    );
    revalidateLeadGen(clientId);
    testResult = data.success ? 'success' : 'error';
  } catch {
    redirect(`/lead-gen/clients/${clientId}/api?test=error`);
  }

  redirect(`/lead-gen/clients/${clientId}/api?test=${testResult}`);
}

export async function testSmtpAction(clientId: number) {
  let testResult: 'success' | 'error' = 'error';

  try {
    const data = await leadGenMutate<{ success: boolean; message: string }>(
      `/clients/${clientId}/test-smtp`,
      'POST'
    );
    revalidateLeadGen(clientId);
    testResult = data.success ? 'success' : 'error';
  } catch {
    redirect(`/lead-gen/clients/${clientId}/smtp?test=error`);
  }

  redirect(`/lead-gen/clients/${clientId}/smtp?test=${testResult}`);
}

export async function testGlobalSmtpAction() {
  let testResult: 'success' | 'error' = 'error';

  try {
    const data = await leadGenMutate<{ success: boolean; message: string }>(
      '/smtp-servers/test',
      'POST'
    );
    testResult = data.success ? 'success' : 'error';
  } catch {
    redirect('/lead-gen/smtp?test=error');
  }

  redirect(`/lead-gen/smtp?test=${testResult}`);
}

export async function updateSubmissionAction(
  clientId: number,
  submissionId: number,
  formData: FormData
) {
  const payload: Record<string, unknown> = {};
  if (formData.has('imported_present')) {
    payload.imported = formData.get('imported') === 'on';
  }
  const leadStatus = formData.get('lead_status');
  if (leadStatus !== null) payload.lead_status = leadStatus.toString();

  try {
    await leadGenMutate(
      `/clients/${clientId}/submissions/${submissionId}`,
      'PATCH',
      payload
    );
    revalidateLeadGen(clientId);
  } catch {
    redirect(
      `/lead-gen/clients/${clientId}/submissions/${submissionId}?error=true`
    );
  }

  redirect(
    `/lead-gen/clients/${clientId}/submissions/${submissionId}?success=true`
  );
}

export async function resendSubmissionEmailAction(
  clientId: number,
  submissionId: number
) {
  let resentResult: 'success' | 'error' = 'error';

  try {
    const data = await leadGenMutate<{
      success: boolean;
      message: string;
      email_sent: boolean;
    }>(`/clients/${clientId}/submissions/${submissionId}/resend-email`, 'POST');
    revalidateLeadGen(clientId, submissionId);
    resentResult = data.success ? 'success' : 'error';
  } catch {
    redirect(
      `/lead-gen/clients/${clientId}/submissions/${submissionId}?resent=error`
    );
  }

  redirect(
    `/lead-gen/clients/${clientId}/submissions/${submissionId}?resent=${resentResult}`
  );
}

export async function advanceWizardStepAction(clientId: number, step: number) {
  redirect(`/lead-gen/clients/new?clientId=${clientId}&step=${step}`);
}
