'use client';

import { FormEvent, useState } from 'react';
import JSZip from 'jszip';
import ClipLoader from 'react-spinners/ClipLoader';
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

import MarkdownTree from './MarkdownTree';
import MarkdownPreview from './MarkdownPreview';
import { buildTree, type MarkdownFile } from './types';

type ConvertResult = {
  ok: number;
  fail: number;
  count: number;
  files: MarkdownFile[];
};

export default function SitemapToMarkdownForm({ count }: { count: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [useFile, setUseFile] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [selected, setSelected] = useState<MarkdownFile | null>(null);
  const { toast } = useToast();

  const tree = result?.files ? buildTree(result.files) : [];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setResult(null);
    setSelected(null);
    const formData = new FormData(e.currentTarget);

    if (useFile) {
      formData.delete('url');
    } else {
      formData.delete('file');
    }

    try {
      const res = await fetch('/api/sitemap-to-markdown', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast({
          title:
            data?.message ??
            'Error converting sitemap to markdown. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const files: MarkdownFile[] = data.files ?? [];
      setResult({
        ok: data.ok ?? files.length,
        fail: data.fail ?? 0,
        count: data.count ?? files.length,
        files,
      });
      setSelected(files[0] ?? null);
      toast({
        title: `Converted ${data.ok ?? files.length} page${
          (data.ok ?? files.length) === 1 ? '' : 's'
        } to markdown`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error converting sitemap to markdown. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!result?.files.length) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const file of result.files) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap-markdown.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to create ZIP download.',
        variant: 'destructive',
      });
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="max-w-lg w-full transition-all">
        <CardHeader>
          <CardTitle>Sitemap to Markdown</CardTitle>
          <CardDescription>
            {count} sitemap{count === 1 ? '' : 's'} converted so far!
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
                  Crawling
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
            Crawls up to 100 pages. Supports urlset and sitemap indexes,
            including .xml.gz.
          </p>
          <p className="text-sm">Maximum sitemap size: 20 MB</p>
        </CardFooter>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {result.ok.toLocaleString()} file
              {result.ok === 1 ? '' : 's'} written
              {result.fail > 0
                ? ` · ${result.fail.toLocaleString()} failed`
                : ''}
            </p>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={!result.files.length || isZipping}
            >
              {isZipping ? 'Preparing ZIP…' : 'Download ZIP'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(14rem,20rem)_1fr]">
            <div className="rounded-lg border">
              <div className="border-b px-3 py-2 text-sm font-medium">
                Markdown tree
              </div>
              <MarkdownTree
                tree={tree}
                selectedPath={selected?.path ?? null}
                onSelect={setSelected}
              />
            </div>
            <div className="rounded-lg border">
              <MarkdownPreview file={selected} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
