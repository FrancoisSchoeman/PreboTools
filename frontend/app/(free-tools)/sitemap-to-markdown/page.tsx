import SitemapToMarkdownForm from './_components/SitemapToMarkdownForm';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap to Markdown - Free Forever, No Ads!',
  description:
    'Crawl a sitemap (URL or file) and convert each page to markdown. Preview the file tree and download a ZIP of folders and .md files.',
  keywords:
    'Prebo Digital, online tools, sitemap to markdown, xml sitemap, markdown converter, free seo tools, marketing tools',
  openGraph: {
    title: 'Sitemap to Markdown - Free Forever, No Ads!',
    description:
      'Crawl a sitemap (URL or file) and convert each page to markdown. Preview the file tree and download a ZIP of folders and .md files.',
    siteName: 'Prebo Digital Tools',
  },
};

export default async function SitemapToMarkdownPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/sitemap-to-markdown/count`;

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
            Convert a sitemap to markdown, for free!
          </h1>
          <p>
            Paste a sitemap URL or upload an XML / gzipped sitemap. We crawl up
            to 100 pages, extract main content as markdown, let you browse the
            file tree, and download a ZIP.
          </p>
        </div>
        <SitemapToMarkdownForm count={count} />
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>Paste a sitemap URL or upload a .xml / .xml.gz file.</li>
            <li>
              Click Convert — we expand indexes, crawl up to 100 pages, and
              extract markdown.
            </li>
            <li>Browse the folder tree and click a file to preview.</li>
            <li>Click Download ZIP to save folders and .md files.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] mx-auto">
          <h2 className="text-2xl font-bold mb-2">Benefits</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              <span className="font-bold">LLM-ready content:</span> turn site
              pages into clean markdown files.
            </li>
            <li>
              <span className="font-bold">Folder structure preserved:</span>{' '}
              paths mirror URL segments.
            </li>
            <li>
              <span className="font-bold">Preview before download:</span> inspect
              any file in the tree.
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
