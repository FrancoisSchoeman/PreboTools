import OnboardingWizard from '../../_components/OnboardingWizard';
import { leadGenFetch } from '@/lib/leadGenApi';
import {
  LeadGenClientDetail,
  LeadGenHealthCheck,
  LeadGenSmtpServer,
} from '@/lib/types';

type SearchParams = Promise<{
  step?: string;
  clientId?: string;
  error?: string;
}>;

export default async function NewClientPage(props: { searchParams: SearchParams }) {
  const { step = '1', clientId, error } = await props.searchParams;
  const currentStep = Number(step) || 1;
  const id = clientId ? Number(clientId) : undefined;

  let client: LeadGenClientDetail | undefined;
  let smtpServers: LeadGenSmtpServer[] = [];
  let healthChecks: LeadGenHealthCheck[] = [];

  if (id && currentStep >= 2) {
    try {
      client = await leadGenFetch<LeadGenClientDetail>(`/clients/${id}`);
      smtpServers = await leadGenFetch<LeadGenSmtpServer[]>('/smtp-servers');
    } catch {
      client = undefined;
    }
  }

  if (id && currentStep === 4 && client) {
    try {
      const health = await leadGenFetch<{ checks: LeadGenHealthCheck[] }>(
        `/clients/${id}/health`
      );
      healthChecks = health.checks;
    } catch {
      healthChecks = [];
    }
  }

  return (
    <OnboardingWizard
      step={currentStep}
      clientId={id}
      client={client}
      smtpServers={smtpServers}
      healthChecks={healthChecks}
      error={error === 'true'}
    />
  );
}

export const dynamic = 'force-dynamic';
