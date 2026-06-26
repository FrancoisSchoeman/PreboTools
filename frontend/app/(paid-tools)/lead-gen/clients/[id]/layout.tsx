import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import ClientSidebar from '../../_components/ClientSidebar';
import { Button } from '@/components/ui/button';
import { leadGenFetch } from '@/lib/leadGenApi';
import { LeadGenClientDetail } from '@/lib/types';

type Params = Promise<{ id: string }>;

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  let client: LeadGenClientDetail;

  try {
    client = await leadGenFetch<LeadGenClientDetail>(`/clients/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/lead-gen/clients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all clients
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <ClientSidebar clientId={client.id} companyName={client.company_name} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
