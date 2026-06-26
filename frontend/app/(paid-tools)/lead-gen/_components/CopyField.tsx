'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { useState } from 'react';

export default function CopyField({
  label,
  value,
  masked = false,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(!masked);

  const displayValue =
    masked && !revealed ? '••••••••-••••-••••-••••-••••••••••••' : value;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input readOnly value={displayValue} className="font-mono text-sm" />
        {masked && (
          <Button type="button" variant="outline" onClick={() => setRevealed(!revealed)}>
            {revealed ? 'Hide' : 'Show'}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast({ title: 'Copied to clipboard' });
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
