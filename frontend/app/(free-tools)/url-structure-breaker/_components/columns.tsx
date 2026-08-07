'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type StructureRow = {
  url: string;
  relative_path: string;
  segments: string[];
};

function sortableHeader(label: string) {
  function SortableHeader({
    column,
  }: {
    column: {
      toggleSorting: (asc: boolean) => void;
      getIsSorted: () => false | 'asc' | 'desc';
    };
  }) {
    return (
      <Button
        className="px-2 -ml-2"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  }
  SortableHeader.displayName = `SortableHeader(${label})`;
  return SortableHeader;
}

export function buildColumns(maxDepth: number): ColumnDef<StructureRow>[] {
  const cols: ColumnDef<StructureRow>[] = [
    {
      accessorKey: 'url',
      header: sortableHeader('url'),
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 dark:text-sky-400 underline break-all"
        >
          {row.original.url}
        </a>
      ),
    },
    {
      accessorKey: 'relative_path',
      header: sortableHeader('relative_path'),
      cell: ({ row }) => (
        <span className="break-all">{row.original.relative_path}</span>
      ),
    },
  ];

  for (let i = 0; i < maxDepth; i++) {
    const index = i;
    cols.push({
      id: `path_${index + 1}`,
      accessorFn: (row) => row.segments[index] ?? '',
      header: sortableHeader(`path_${index + 1}`),
      cell: ({ row }) => row.original.segments[index] ?? '',
    });
  }

  return cols;
}
