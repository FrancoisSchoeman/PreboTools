'use client';

import { FormEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/DataTable';
import ClipLoader from 'react-spinners/ClipLoader';

import { columns, CSV_HEADERS, type ProductRow } from './columns';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToCsv(rows: ProductRow[]): string {
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((row) =>
      CSV_HEADERS.map((key) => escapeCsvCell(row[key] ?? '')).join(',')
    ),
  ];
  return lines.join('\n');
}

export default function GmcXmlToCsvForm({ count }: { count: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useFile, setUseFile] = useState(false);
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setRows(null);
    const formData = new FormData(e.currentTarget);

    if (useFile) {
      formData.delete('url');
    } else {
      formData.delete('file');
    }

    try {
      const res = await fetch('/api/gmc-xml-to-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast({
          title: data?.message ?? 'Error converting feed. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setRows(data.rows ?? []);
      toast({
        title: `Converted ${data.count ?? data.rows?.length ?? 0} products`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error converting feed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDownload() {
    if (!rows?.length) return;
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gmc-products.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full space-y-6">
      <Card className="max-w-lg w-full transition-all">
        <CardHeader>
          <CardTitle>GMC XML to CSV</CardTitle>
          <CardDescription>
            {count} feed{count === 1 ? '' : 's'} converted so far!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-4">
              <Switch
                id="use-file"
                checked={useFile}
                onCheckedChange={setUseFile}
              />
              <Label htmlFor="use-file">Upload file instead of URL</Label>
            </div>

            {!useFile ? (
              <div className="space-y-1">
                <Label htmlFor="url">Feed URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/products.xml"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="file">Feed file</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".xml,application/xml,text/xml"
                />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Converting
                  <ClipLoader
                    color="#f35c33"
                    loading={true}
                    size={18}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </>
              ) : (
                'Convert'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col justify-start items-start gap-1">
          <p className="text-sm">
            Google Merchant Center RSS/XML feeds. Price split, tax, and up to 3
            shipping rows flattened.
          </p>
          <p className="text-sm">Maximum feed size: 20 MB</p>
        </CardFooter>
      </Card>

      {rows && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length.toLocaleString()} product
              {rows.length === 1 ? '' : 's'} found
            </p>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={rows.length === 0}
            >
              Download CSV
            </Button>
          </div>
          <DataTable columns={columns} data={rows} filterColumn="title" />
        </div>
      )}
    </div>
  );
}
