import { Badge } from '@/components/ui/badge';

type EmailStatusBadgeProps = {
  emailSent: boolean;
  emailError?: string;
};

export default function EmailStatusBadge({
  emailSent,
  emailError = '',
}: EmailStatusBadgeProps) {
  if (emailSent) {
    return <Badge variant="default">Sent</Badge>;
  }

  if (emailError) {
    return <Badge variant="destructive">Failed</Badge>;
  }

  return <Badge variant="secondary">Not sent</Badge>;
}
