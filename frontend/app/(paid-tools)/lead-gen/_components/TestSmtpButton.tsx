'use client';

import SubmitButton from '@/components/SubmitButton';
import { testGlobalSmtpAction, testSmtpAction } from '@/actions/leadGen';

export default function TestSmtpButton({ clientId }: { clientId?: number }) {
  return (
    <form action={clientId ? testSmtpAction.bind(null, clientId) : testGlobalSmtpAction}>
      <SubmitButton submitText="Testing">Test Connection</SubmitButton>
    </form>
  );
}
