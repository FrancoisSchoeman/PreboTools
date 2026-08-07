'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type ProductRow = {
  id: string;
  title: string;
  description: string;
  google_product_category: string;
  product_type: string;
  link: string;
  image_link: string;
  additional_image_links: string;
  original_image_url: string;
  condition: string;
  availability: string;
  price_value: string;
  price_currency: string;
  brand: string;
  identifier_exists: string;
  color: string;
  size: string;
  tax_country: string;
  tax_rate: string;
  tax_ship: string;
  shipping_1_country: string;
  shipping_1_service: string;
  shipping_1_price: string;
  shipping_2_country: string;
  shipping_2_service: string;
  shipping_2_price: string;
  shipping_3_country: string;
  shipping_3_service: string;
  shipping_3_price: string;
};

export const CSV_HEADERS: (keyof ProductRow)[] = [
  'id',
  'title',
  'description',
  'google_product_category',
  'product_type',
  'link',
  'image_link',
  'additional_image_links',
  'original_image_url',
  'condition',
  'availability',
  'price_value',
  'price_currency',
  'brand',
  'identifier_exists',
  'color',
  'size',
  'tax_country',
  'tax_rate',
  'tax_ship',
  'shipping_1_country',
  'shipping_1_service',
  'shipping_1_price',
  'shipping_2_country',
  'shipping_2_service',
  'shipping_2_price',
  'shipping_3_country',
  'shipping_3_service',
  'shipping_3_price',
];

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

export const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: 'id',
    header: sortableHeader('id'),
  },
  {
    accessorKey: 'image_link',
    header: 'image',
    cell: ({ row }) => {
      const src = row.original.image_link;
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-10 w-10 object-contain"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: sortableHeader('title'),
    cell: ({ row }) => (
      <span className="max-w-[28ch] truncate block" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: 'price_value',
    header: sortableHeader('price'),
  },
  {
    accessorKey: 'price_currency',
    header: sortableHeader('currency'),
  },
  {
    accessorKey: 'availability',
    header: sortableHeader('availability'),
  },
  {
    accessorKey: 'brand',
    header: sortableHeader('brand'),
  },
  {
    accessorKey: 'link',
    header: sortableHeader('link'),
    cell: ({ row }) =>
      row.original.link ? (
        <a
          href={row.original.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 dark:text-sky-400 underline break-all"
        >
          Open
        </a>
      ) : null,
  },
];
