import { LeadGenHealthCheck } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function HealthCheckList({
  checks,
}: {
  checks: LeadGenHealthCheck[];
}) {
  return (
    <ul className="space-y-3">
      {checks.map((check) => (
        <li
          key={check.key}
          className="flex items-start gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3"
        >
          {check.ok ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">{check.label}</p>
            <p className="text-sm text-muted-foreground">{check.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
