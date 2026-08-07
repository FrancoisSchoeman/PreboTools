'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type SitemapRow = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

function sortableHeader(label: string) {
  return ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' } }) => (
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

export const columns: ColumnDef<SitemapRow>[] = [
  {
    accessorKey: 'loc',
    header: sortableHeader('loc'),
    cell: ({ row }) => (
      <a
        href={row.original.loc}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-600 dark:text-sky-400 underline break-all"
      >
        {row.original.loc}
      </a>
    ),
  },
  {
    accessorKey: 'lastmod',
    header: sortableHeader('lastmod'),
  },
  {
    accessorKey: 'changefreq',
    header: sortableHeader('changefreq'),
  },
  {
    accessorKey: 'priority',
    header: sortableHeader('priority'),
  },
];
