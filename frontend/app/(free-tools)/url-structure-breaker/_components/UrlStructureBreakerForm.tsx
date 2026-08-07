'use client';

import { FormEvent, useMemo, useState } from 'react';
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

import { buildColumns, type StructureRow } from './columns';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToCsv(rows: StructureRow[], maxDepth: number): string {
  const header = [
    'url',
    'relative_path',
    ...Array.from({ length: maxDepth }, (_, i) => `path_${i + 1}`),
  ];
  const lines = [
    header.join(','),
    ...rows.map((row) => {
      const cells = [row.url, row.relative_path];
      for (let i = 0; i < maxDepth; i++) {
        cells.push(row.segments[i] ?? '');
      }
      return cells.map(escapeCsvCell).join(',');
    }),
  ];
  return lines.join('\n');
}

export default function UrlStructureBreakerForm({ count }: { count: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useFile, setUseFile] = useState(false);
  const [rows, setRows] = useState<StructureRow[] | null>(null);
  const [maxDepth, setMaxDepth] = useState(0);
  const { toast } = useToast();

  const columns = useMemo(() => buildColumns(maxDepth), [maxDepth]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setRows(null);
    setMaxDepth(0);
    const formData = new FormData(e.currentTarget);

    if (useFile) {
      formData.delete('url');
    } else {
      formData.delete('file');
    }

    try {
      const res = await fetch('/api/url-structure-breaker', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast({
          title:
            data?.message ?? 'Error breaking URL structure. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setRows(data.rows ?? []);
      setMaxDepth(data.max_depth ?? 0);
      toast({
        title: `Broke ${data.count ?? data.rows?.length ?? 0} URLs`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error breaking URL structure. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDownload() {
    if (!rows?.length) return;
    const csv = rowsToCsv(rows, maxDepth);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-structure.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full space-y-6">
      <Card className="max-w-lg w-full transition-all">
        <CardHeader>
          <CardTitle>URL Structure Breaker</CardTitle>
          <CardDescription>
            {count} sitemap{count === 1 ? '' : 's'} processed so far!
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
                <Label htmlFor="url">Sitemap URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/sitemap.xml"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="file">Sitemap file</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".xml,.gz,.xml.gz,application/xml,text/xml,application/gzip"
                />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Breaking
                  <ClipLoader
                    color="#f35c33"
                    loading={true}
                    size={18}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </>
              ) : (
                'Break Structure'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col justify-start items-start gap-1">
          <p className="text-sm">
            Supports urlset and sitemap index files, including .xml.gz.
          </p>
          <p className="text-sm">Maximum sitemap size: 20 MB</p>
        </CardFooter>
      </Card>

      {rows && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length.toLocaleString()} URL
              {rows.length === 1 ? '' : 's'} found
              {maxDepth > 0 ? ` · max depth ${maxDepth}` : ''}
            </p>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={rows.length === 0}
            >
              Download CSV
            </Button>
          </div>
          <DataTable columns={columns} data={rows} filterColumn="url" />
        </div>
      )}
    </div>
  );
}
