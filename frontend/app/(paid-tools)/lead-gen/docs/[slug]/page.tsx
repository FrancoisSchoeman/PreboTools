import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import MarkdownDoc from '../_components/MarkdownDoc';
import { Button } from '@/components/ui/button';
import { getLeadGenDoc, isLeadGenDocSlug } from '@/lib/leadGenDocs';

type Params = Promise<{ slug: string }>;

export default async function LeadGenDocPage(props: { params: Params }) {
  const { slug } = await props.params;

  if (!isLeadGenDocSlug(slug)) {
    notFound();
  }

  const { content } = getLeadGenDoc(slug);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/lead-gen/clients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lead Gen
        </Link>
      </Button>

      <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 p-6 md:p-8">
        <MarkdownDoc content={content} />
      </div>
    </div>
  );
}

export async function generateMetadata(props: { params: Params }) {
  const { slug } = await props.params;

  if (!isLeadGenDocSlug(slug)) {
    return { title: 'Documentation' };
  }

  const { title } = getLeadGenDoc(slug);
  return { title: `${title} — Lead Gen` };
}

export const dynamic = 'force-dynamic';
