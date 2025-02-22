import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SubmitButton from '@/components/SubmitButton';

import {
  optimiseFeedImportAction,
  optimiseFeedUploadAction,
} from '@/actions/feedOptimiser';

export function FeedOptimiserForm() {
  return (
    <Tabs defaultValue="import">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="import">Import Feed URL</TabsTrigger>
        <TabsTrigger value="upload">Upload CSV / XML</TabsTrigger>
      </TabsList>
      <TabsContent value="import">
        <Card>
          <CardHeader>
            <CardTitle>Import</CardTitle>
            <CardDescription>
              *Limited to 5 products during development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={optimiseFeedImportAction} className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="feed-name">Feed Name</Label>
                <Input
                  id="feed-name"
                  name="feed-name"
                  required
                  placeholder='e.g. "Weelee Feed"'
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="feed-url">Feed URL</Label>
                <Input
                  id="feed-url"
                  name="feed-url"
                  required
                  placeholder='e.g. "https://example.com/feed.xml"'
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="feed-type">Feed Type</Label>
                <Select name="feed-type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Feed Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress">WordPress</SelectItem>
                    <SelectItem value="shopify">Shopify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="file-format">File Format</Label>
                <Select name="file-format" required>
                  <SelectTrigger>
                    <SelectValue placeholder="File Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <SubmitButton submitText="Optimising">
                  Optimise Feed
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
            <CardDescription>
              Upload a feed file to optimise (CSV or XML)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <form action={optimiseFeedUploadAction} className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="feed-name">Feed Name</Label>
                <Input
                  id="feed-name"
                  name="feed-name"
                  type="text"
                  required
                  placeholder='e.g. "Weelee Feed"'
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="feed-file">Upload File</Label>
                <Input
                  id="feed-file"
                  name="feed-file"
                  type="file"
                  accept=".xml, .csv"
                  required
                />
              </div>
              <div className="space-y-1">
                <SubmitButton submitText="Optimising">
                  Optimise Feed
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
