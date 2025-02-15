'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CopyButton({
  children,
  data,
}: {
  children: React.ReactNode;
  data: string;
}) {
  const { toast } = useToast();
  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(data);
        toast({
          title: 'Copied to clipboard!',
        });
      }}
    >
      {children}
    </Button>
  );
}
