'use client';

import SubmitButton from '@/components/SubmitButton';
import { testEndpointAction } from '@/actions/leadGen';

export default function TestEndpointButton({ clientId }: { clientId: number }) {
  return (
    <form action={testEndpointAction.bind(null, clientId)}>
      <SubmitButton submitText="Testing">Test Endpoint</SubmitButton>
    </form>
  );
}
