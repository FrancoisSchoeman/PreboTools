'use client';

import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';

import { LeadGenActivity } from '@/lib/types';

export const activityColumns: ColumnDef<LeadGenActivity>[] = [
  {
    accessorKey: 'created_at',
    header: 'Timestamp',
    cell: ({ row }) =>
      format(new Date(row.original.created_at), 'dd/MM/yyyy HH:mm:ss'),
  },
  {
    accessorKey: 'event_type',
    header: 'Event',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.event_type}</span>
    ),
  },
  {
    accessorKey: 'message',
    header: 'Message',
  },
];
