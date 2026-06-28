'use client';

import SubmitButton from '@/components/SubmitButton';
import { resendSubmissionEmailAction } from '@/actions/leadGen';

export default function ResendEmailButton({
  clientId,
  submissionId,
}: {
  clientId: number;
  submissionId: number;
}) {
  return (
    <form action={resendSubmissionEmailAction.bind(null, clientId, submissionId)}>
      <SubmitButton submitText="Sending">Resend Email</SubmitButton>
    </form>
  );
}
