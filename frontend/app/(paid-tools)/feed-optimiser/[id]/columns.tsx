'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { FeedProduct } from '@/lib/types';
import { refreshProductAction } from '@/actions/feedOptimiser';
import SubmitButton from '@/components/SubmitButton';

export const columns: ColumnDef<FeedProduct>[] = [
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const feed = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <form action={refreshProductAction}>
                <input type="hidden" name="feed_id" value={feed.feed_id} />
                <input
                  type="hidden"
                  name="product_id"
                  value={feed.product_id}
                />
                <SubmitButton className="p-1 aspect-square max-h-7">
                  <RefreshCw size={10} />
                </SubmitButton>
              </form>
            </TooltipTrigger>
            <TooltipContent>
              <p>Re-optimise product</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
    accessorKey: 'product_id',
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
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <div className="w-[30ch]">
          <Button
            className="px-2 -ml-2"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <>
          {description ? (
            <Accordion type="single" collapsible className="w-[40ch]">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="w-full">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span>{description.slice(0, 30) + '...'}</span>
                    <span>Read More</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: description as TrustedHTML,
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
    accessorKey: 'link',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Link
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const link = row.getValue('link') as string;
      return (
        <>
          {link ? (
            <Link className="hover:underline" target="_blank" href={link}>
              Product Link
            </Link>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'image_link',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Image Link
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const image_link = row.getValue('image_link') as string;
      return (
        <>
          {image_link ? (
            <Link className="hover:underline" target="_blank" href={image_link}>
              Image Link
            </Link>
          ) : (
            'N/A'
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'availability',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Availability
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'color',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Color
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'product_type',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'brand',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Brand
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'identifier_exists',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Identifier Exists?
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'material',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Material
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'condition',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Condition
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => {
      return (
        <Button
          className="px-2 -ml-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Size
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
