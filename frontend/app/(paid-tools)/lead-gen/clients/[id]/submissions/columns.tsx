'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { deleteSubmissionAction } from '@/actions/leadGen';
import LeadScoreBadge from '../../../_components/LeadScoreBadge';
import EmailStatusBadge from '../../../_components/EmailStatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadGenSubmission } from '@/lib/types';

export const columns: ColumnDef<LeadGenSubmission>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
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
    accessorKey: 'lead_score',
    header: 'Lead Score',
    filterFn: (row, columnId, filterValue) =>
      row.getValue(columnId) === filterValue,
    cell: ({ row }) => <LeadScoreBadge score={row.original.lead_score} />,
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
      <EmailStatusBadge
        emailSent={row.original.email_sent}
        emailError={row.original.email_error}
      />
    ),
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) =>
      format(new Date(row.original.submitted_at), 'dd/MM/yyyy HH:mm'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const submission = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={`/lead-gen/clients/${submission.client_id}/submissions/${submission.id}`}
              >
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete submission #{submission.id}
                    {submission.email ? ` from ${submission.email}` : ''}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={() =>
                      deleteSubmissionAction(
                        submission.client_id,
                        submission.id
                      )
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
