'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadGenSubmission } from '@/lib/types';

export const columns: ColumnDef<LeadGenSubmission>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-2 -ml-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/lead-gen/clients/${row.original.client_id}/submissions/${row.original.id}`}
        className="hover:underline"
      >
        {row.original.email || '—'}
      </Link>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || '—',
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = [row.original.first_name, row.original.last_name]
        .filter(Boolean)
        .join(' ');
      return name || '—';
    },
  },
  {
    accessorKey: 'gclid',
    header: 'GCLID',
    cell: ({ row }) =>
      row.original.gclid ? (
        <span className="font-mono text-xs truncate max-w-[120px] block">
          {row.original.gclid}
        </span>
      ) : (
        '—'
      ),
  },
  {
    accessorKey: 'email_sent',
    header: 'Email',
    cell: ({ row }) => (
      <Badge variant={row.original.email_sent ? 'default' : 'destructive'}>
        {row.original.email_sent ? 'Sent' : 'Failed'}
      </Badge>
    ),
  },
  {
    accessorKey: 'imported',
    header: 'Imported',
    cell: ({ row }) => (row.original.imported ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) =>
      format(new Date(row.original.submitted_at), 'dd/MM/yyyy HH:mm'),
  },
];
