import SitemapToCsvForm from './_components/SitemapToCsvForm';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap to CSV - Free Forever, No Ads!',
  description:
    'Convert an XML sitemap (URL or file) to CSV for free. Supports sitemap indexes and gzipped sitemaps. View results inline and download as CSV.',
  keywords:
    'Prebo Digital, online tools, sitemap to csv, xml sitemap, sitemap converter, free seo tools, marketing tools',
  openGraph: {
    title: 'Sitemap to CSV - Free Forever, No Ads!',
    description:
      'Convert an XML sitemap (URL or file) to CSV for free. Supports sitemap indexes and gzipped sitemaps. View results inline and download as CSV.',
    siteName: 'Prebo Digital Tools',
  },
};

export default async function SitemapToCsvPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/sitemap-to-csv/count`;

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
            Convert a sitemap to CSV, for free!
          </h1>
          <p>
            Paste a sitemap URL or upload an XML / gzipped sitemap. We follow
            sitemap indexes, show URLs in a table, and let you download the CSV.
          </p>
        </div>
        <SitemapToCsvForm count={count} />
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>Paste a sitemap URL or upload a .xml / .xml.gz file.</li>
            <li>
              Click Convert — indexes are expanded and gzipped files are
              decompressed.
            </li>
            <li>Review URLs in the table (loc, lastmod, changefreq, priority).</li>
            <li>Click Download CSV to save the file.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">Benefits</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              <span className="font-bold">Audit URLs fast:</span> open any
              sitemap as a sortable, filterable table.
            </li>
            <li>
              <span className="font-bold">Index-aware:</span> child sitemaps are
              fetched automatically.
            </li>
            <li>
              <span className="font-bold">Gzip support:</span> works with
              compressed sitemaps.
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
