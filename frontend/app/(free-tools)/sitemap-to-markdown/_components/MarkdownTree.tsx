'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { MarkdownFile, TreeNode } from './types';

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (file: MarkdownFile) => void;
}) {
  const isFolder = Boolean(node.children);
  const [open, setOpen] = useState(depth < 2);
  const isSelected = node.file && selectedPath === node.file.path;

  if (isFolder) {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-sm hover:bg-muted',
        isSelected && 'bg-muted font-medium'
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => node.file && onSelect(node.file)}
    >
      <span className="w-3.5 shrink-0" />
      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export default function MarkdownTree({
  tree,
  selectedPath,
  onSelect,
}: {
  tree: TreeNode[];
  selectedPath: string | null;
  onSelect: (file: MarkdownFile) => void;
}) {
  if (tree.length === 0) {
    return (
      <p className="p-3 text-sm text-muted-foreground">No files to show.</p>
    );
  }

  return (
    <div className="max-h-[28rem] overflow-auto py-1">
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
