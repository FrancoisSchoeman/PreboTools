'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

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
import ClientStatusBadge from '../_components/ClientStatusBadge';
import { LeadGenClient } from '@/lib/types';
import { deleteClientAction } from '@/actions/leadGen';

export const columns: ColumnDef<LeadGenClient>[] = [
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
    accessorKey: 'company_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-2 -ml-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/lead-gen/clients/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.company_name}
      </Link>
    ),
  },
  {
    accessorKey: 'contact_email',
    header: 'Contact Email',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => <ClientStatusBadge active={row.original.is_active} />,
  },
  {
    accessorKey: 'google_offline_enabled',
    header: 'Google Offline',
    cell: ({ row }) => (row.original.google_offline_enabled ? 'Enabled' : 'Disabled'),
  },
  {
    accessorKey: 'date_created',
    header: 'Created',
    cell: ({ row }) => format(new Date(row.original.date_created), 'dd/MM/yyyy'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original;
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
              <Link href={`/lead-gen/clients/${client.id}`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/lead-gen/clients/${client.id}/settings`}>
                Settings
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
                  <AlertDialogTitle>Delete client?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {client.company_name} and all
                    submissions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={() => deleteClientAction(client.id)}
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
