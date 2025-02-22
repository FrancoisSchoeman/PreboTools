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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import type { KeywordAnalysis } from '@/lib/types';
import { deleteKeywordAnalysisAction } from '@/actions/keywordAnalyser';

export const columns: ColumnDef<KeywordAnalysis>[] = [
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/seo-analysis/${data.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger className="text-sm hover:bg-accent w-full px-2 py-1.5 text-left rounded-sm transition-colors">
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this analysed result.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={() => deleteKeywordAnalysisAction(data.id!)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/api/seo-analysis/${data.id}`}>Export to CSV</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
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
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'url',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Link className="hover:underline" href={data.url} target="_blank">
          {data.url}
        </Link>
      );
    },
  },
  {
    accessorKey: 'mapped_keyword',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mapped Keyword
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'meta_title',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Original Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const metaTitle = row.getValue('meta_title') as string;
      return (
        <>
          {metaTitle ? (
            <Accordion type="single" collapsible className="w-[40ch]">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="w-full">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span>{metaTitle.slice(0, 30) + '...'}</span>
                    <span>Read More</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: metaTitle as TrustedHTML,
                    }}
                  ></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'meta_description',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Original Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const metaDescription = row.getValue('meta_description') as string;
      return (
        <>
          {metaDescription ? (
            <Accordion type="single" collapsible className="w-[40ch]">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="w-full">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span>{metaDescription.slice(0, 30) + '...'}</span>
                    <span>Read More</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: metaDescription as TrustedHTML,
                    }}
                  ></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'new_title',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          New Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const newTitle = row.getValue('new_title') as string;
      return (
        <>
          {newTitle ? (
            <Accordion type="single" collapsible className="w-[40ch]">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="w-full">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span>{newTitle.slice(0, 30) + '...'}</span>
                    <span>Read More</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: newTitle as TrustedHTML,
                    }}
                  ></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'new_description',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          New Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const newDescription = row.getValue('new_description') as string;
      return (
        <>
          {newDescription ? (
            <Accordion type="single" collapsible className="w-[40ch]">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="w-full">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span>{newDescription.slice(0, 30) + '...'}</span>
                    <span>Read More</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: newDescription as TrustedHTML,
                    }}
                  ></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'date_created',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date_created = row.getValue('date_created') as string;
      const formatted = format(new Date(date_created), 'dd/MM/yyyy');

      return <div className="">{formatted}</div>;
    },
  },
  {
    accessorKey: 'date_modified',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date Modified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date_modified = row.getValue('date_modified') as string;
      const formatted = format(new Date(date_modified), 'dd/MM/yyyy');

      return <div className="">{formatted}</div>;
    },
  },
];
