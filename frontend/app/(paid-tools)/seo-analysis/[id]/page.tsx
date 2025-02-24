import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

// import CopyButton from '../_components/CopyButton';
import DeleteActionButton from '@/components/DeleteActionButton';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

import { deleteKeywordAnalysisAction } from '@/actions/keywordAnalyser';
import type { KeywordAnalysisResults } from '@/lib/types';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type Params = Promise<{ id: string }>;

export default async function FeedPage(props: {
  searchParams: SearchParams;
  params: Params;
}) {
  const { id } = await props.params;

  const apiURL = `${process.env.BACKEND_URL}/api/keyword-analyser/`;

  const res = await fetch(`${apiURL}${id}`, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  let data: KeywordAnalysisResults | null = null;
  try {
    data = await res.json();
  } catch (e) {
    console.error('Error message at SEO Analysis Page: ', e);
    const error = await res.text();
    console.error('Error response at SEO Analysis Page: ', error);
    console.error(res);
    notFound();
  }

  if (!res.ok || !data || !data.results) {
    notFound();
  }

  const { results } = data;

  const formattedCreatedDate = format(
    new Date(results.date_created),
    'dd/MM/yyyy'
  );
  const formattedModifiedDate = format(
    new Date(results.date_modified),
    'dd/MM/yyyy'
  );

  return (
    <div className="mb-8 md:my-8">
      <Card className="bg-white dark:bg-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex justify-between">
            Results
            <div className="flex justify-between items-center gap-1">
              <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                ID:{' '}
                <span className="text-neutral-500 dark:text-neutral-400">
                  {results.id}
                </span>
              </div>
              <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                Date Created:{' '}
                <span className="text-neutral-500 dark:text-neutral-400">
                  {formattedCreatedDate}
                </span>
              </div>

              <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                Date Modified:{' '}
                <span className="text-neutral-500 dark:text-neutral-400">
                  {formattedModifiedDate}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon">
                      <Link href={`/api/seo-analysis/${results.id}`}>
                        <Download />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export as CSV file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DeleteActionButton
                action={deleteKeywordAnalysisAction}
                id={results.id!}
                deleteText="keyword analysis"
              />
            </div>
          </CardTitle>
          <CardDescription className="text-lg">
            <div className="flex justify-between items-center">
              <Link href={results.url} target="_blank">
                {results.url}
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 my-2">
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                <p className="text-lg">Original Title:</p>
                <span className="">{results.meta_title}</span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                <p className="text-lg">Original Description:</p>
                <span className="">{results.meta_description}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                <p className="text-lg">New Title:</p>
                <span className="">{results.new_title}</span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
                <p className="text-lg">New Description:</p>
                <span className="">{results.new_description}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
              <p className="text-lg">User Intent Analysis:</p>
              <ul className=" list-disc list-inside">
                {results.user_intent_analysis.map((intent, index) => (
                  <li key={index}>{intent}</li>
                ))}
              </ul>
            </div>

            <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
              <p className="text-lg">Competitive Insights:</p>
              <ul className=" list-disc list-inside">
                {results.competitive_insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="my-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
            <p className="text-lg">SEO Content Recommendations:</p>
            <ul className=" list-disc list-inside">
              {results.seo_content_recommendations.map((recomm, index) => (
                <li key={index}>{recomm}</li>
              ))}
            </ul>
          </div>

          <div className="mt-2 rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 text-base p-2">
            <p className="text-lg">Content and Blog Ideas:</p>
            <ul className=" list-disc list-inside">
              {results.content_and_blog_ideas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
