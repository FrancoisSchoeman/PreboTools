import UrlStructureBreakerForm from './_components/UrlStructureBreakerForm';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Structure Breaker - Free Forever, No Ads!',
  description:
    'Break sitemap URLs into relative path segments. Paste a sitemap URL or upload XML / gzip, view results inline, and download CSV.',
  keywords:
    'Prebo Digital, online tools, url structure breaker, sitemap path splitter, seo url audit, free seo tools, marketing tools',
  openGraph: {
    title: 'URL Structure Breaker - Free Forever, No Ads!',
    description:
      'Break sitemap URLs into relative path segments. Paste a sitemap URL or upload XML / gzip, view results inline, and download CSV.',
    siteName: 'Prebo Digital Tools',
  },
};

export default async function UrlStructureBreakerPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/url-structure-breaker/count`;

  let count = 0;

  try {
    const res = await fetch(apiURL, {
      headers: {
        'X-API-Key': process.env.INTERNAL_API_KEY!,
      },
    });

    if (res.ok) {
      const data = await res.json();
      count = data.count;
    }
  } catch {
    // Backend may be offline during build/dev
  }

  return (
    <div className="mb-8 md:my-8">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8 space-y-8">
        <div className="max-w-[60ch]">
          <h1 className="text-3xl font-bold mb-6">
            Break sitemap URL structure, for free!
          </h1>
          <p>
            Paste a sitemap URL or upload an XML / gzipped sitemap. We extract
            every URL, split relative paths into segments, show them in a table,
            and let you download CSV.
          </p>
        </div>
        <UrlStructureBreakerForm count={count} />
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>Paste a sitemap URL or upload a .xml / .xml.gz file.</li>
            <li>
              Click Break Structure — indexes are expanded and gzipped files are
              decompressed.
            </li>
            <li>
              Review original URLs plus relative path and path segments in the
              table.
            </li>
            <li>Click Download CSV to save the file.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">Benefits</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              <span className="font-bold">See site architecture:</span> path
              segments make folder depth obvious.
            </li>
            <li>
              <span className="font-bold">CSV-ready:</span> original URL plus
              split columns for spreadsheets.
            </li>
            <li>
              <span className="font-bold">Index + gzip:</span> same sitemap
              support as our other tools.
            </li>
            <li>
              <span className="font-bold">It&apos;s free!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
