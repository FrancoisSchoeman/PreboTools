'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'lucide-react';

export default function CopyButton({
  children,
  data,
}: {
  children: React.ReactNode;
  data: string;
}) {
  const { toast } = useToast();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(data);
              toast({
                title: 'Copied to clipboard!',
              });
            }}
          >
            <Link size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
