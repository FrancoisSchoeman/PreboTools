import GmcXmlToCsvForm from './_components/GmcXmlToCsvForm';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GMC XML to CSV - Free Forever, No Ads!',
  description:
    'Convert a Google Merchant Center XML product feed (URL or file) to CSV for free. View products inline and download as CSV.',
  keywords:
    'Prebo Digital, online tools, gmc xml to csv, google merchant center, product feed converter, free seo tools, marketing tools',
  openGraph: {
    title: 'GMC XML to CSV - Free Forever, No Ads!',
    description:
      'Convert a Google Merchant Center XML product feed (URL or file) to CSV for free. View products inline and download as CSV.',
    siteName: 'Prebo Digital Tools',
  },
};

export default async function GmcXmlToCsvPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/gmc-xml-to-csv/count`;

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
            Convert a GMC XML feed to CSV, for free!
          </h1>
          <p>
            Paste a Google Merchant Center product feed URL or upload an XML
            file. We flatten products into a table and let you download the CSV.
          </p>
        </div>
        <GmcXmlToCsvForm count={count} />
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>Paste a feed URL or upload a .xml file.</li>
            <li>
              Click Convert — products are flattened (price split, tax, up to 3
              shipping rows).
            </li>
            <li>Review products in the table (id, title, price, link, and more).</li>
            <li>Click Download CSV to save the full file.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">Benefits</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              <span className="font-bold">Audit products fast:</span> open any
              GMC feed as a sortable, filterable table.
            </li>
            <li>
              <span className="font-bold">Spreadsheet-ready:</span> price,
              currency, shipping, and tax columns ready for Excel or Sheets.
            </li>
            <li>
              <span className="font-bold">URL or file:</span> fetch a remote feed
              or upload XML directly.
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
