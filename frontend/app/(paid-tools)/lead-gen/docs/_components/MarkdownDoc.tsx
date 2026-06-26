import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { resolveDocLink } from '@/lib/leadGenDocs';

export default function MarkdownDoc({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-8 mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-6 mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-4 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ href, children }) => {
          const resolved = resolveDocLink(href);
          if (resolved?.startsWith('/lead-gen/docs/')) {
            return (
              <Link href={resolved} className="text-blue-600 hover:underline">
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              className="text-blue-600 hover:underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          );
        },
        pre: ({ children }) => (
          <pre className="text-xs overflow-auto rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 mb-4">
            {children}
          </pre>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return <code className={className}>{children}</code>;
          }
          return (
            <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-neutral-200 dark:border-neutral-800">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="text-left font-medium p-2 pr-4">{children}</th>
        ),
        td: ({ children }) => <td className="p-2 pr-4 align-top">{children}</td>,
        tr: ({ children }) => (
          <tr className="border-b border-neutral-100 dark:border-neutral-900">
            {children}
          </tr>
        ),
        hr: () => (
          <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
