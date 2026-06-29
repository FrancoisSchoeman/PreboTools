import { Badge } from '@/components/ui/badge';

const LEAD_SCORE_LABELS: Record<string, string> = {
  not_set: 'Not set',
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
};

const LEAD_SCORE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  not_set: 'outline',
  cold: 'secondary',
  warm: 'default',
  hot: 'destructive',
};

export default function LeadScoreBadge({ score }: { score: string }) {
  const normalized = score in LEAD_SCORE_LABELS ? score : 'not_set';
  return (
    <Badge variant={LEAD_SCORE_VARIANTS[normalized]}>
      {LEAD_SCORE_LABELS[normalized]}
    </Badge>
  );
}
