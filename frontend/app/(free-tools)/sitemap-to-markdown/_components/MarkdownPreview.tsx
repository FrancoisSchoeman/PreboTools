'use client';

import type { MarkdownFile } from './types';

export default function MarkdownPreview({ file }: { file: MarkdownFile | null }) {
  if (!file) {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center p-6 text-sm text-muted-foreground">
        Select a file from the tree to preview its markdown.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[16rem] flex-col">
      <div className="border-b px-3 py-2">
        <p className="truncate text-sm font-medium">{file.title || file.path}</p>
        <p className="truncate text-xs text-muted-foreground">{file.path}</p>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          {file.url}
        </a>
      </div>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed">
        {file.content}
      </pre>
    </div>
  );
}
