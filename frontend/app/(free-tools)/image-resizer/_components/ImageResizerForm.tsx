'use client';

import { useToast } from '@/hooks/use-toast';
import { FormEvent, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ClipLoader from 'react-spinners/ClipLoader';

export default function ImageResizerForm({ count }: { count: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomName, setUseCustomName] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setIsSubmitting(true);

    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const apiURL = `/api/image-resizer`;

    const res = await fetch(apiURL, {
      method: 'POST',
      body: formData,
    });

    try {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resized_images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setIsSubmitting(false);
      toast({ title: 'Images Resized Successfully!' });
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast({
        title: 'Error when resizing images. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="max-w-lg w-full transition-all">
      <CardHeader>
        <CardTitle>Image Resizer</CardTitle>
        <CardDescription>{count} images resized so far!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="images">Select Images</Label>
            <Input
              id="images"
              name="images"
              type="file"
              multiple
              required
              accept=".jpeg,.jpg,.png,.webp,.pdf,.tiff,.jpe,.pcx,.ppm,.sgi,.tga,.bmp,.eps,.gif,.ico"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="width">
              Enter the max width or height in pixels
            </Label>
            <Input
              id="width"
              name="width"
              type="number"
              required
              placeholder='e.g. "1920"'
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="img-format">
              Select format to convert images into
            </Label>
            <Select name="img-format" required defaultValue="jpeg">
              <SelectTrigger>
                <SelectValue placeholder="Image Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="tiff">TIFF</SelectItem>
                <SelectItem value="jpe">JPE</SelectItem>
                <SelectItem value="pcx">PCX</SelectItem>
                <SelectItem value="ppm">PPM</SelectItem>
                <SelectItem value="sgi">SGI</SelectItem>
                <SelectItem value="tga">TGA</SelectItem>
                <SelectItem value="bmp">BMP</SelectItem>
                <SelectItem value="eps">EPS</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="ico">ICO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex gap-4">
            <Switch
              name="use-custom-name"
              id="use-custom-name"
              checked={useCustomName}
              onCheckedChange={() => setUseCustomName(!useCustomName)}
            />
            <Label htmlFor="use-custom-name">Use custom name?</Label>
          </div>
          <div className={`space-y-1 ${useCustomName ? 'block' : 'hidden'}`}>
            <Label htmlFor="custom-name">Enter custom name (optional)</Label>
            <Input
              name="custom-name"
              id="custom-name"
              placeholder="super cool name"
              defaultValue=""
            />
          </div>
          <div className="space-y-1">
            <Button>
              {isSubmitting ? (
                <>
                  Resizing
                  <ClipLoader
                    color="#f35c33"
                    loading={true}
                    size={18}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </>
              ) : (
                'Resize'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col justify-start items-start">
        <p className="text-sm">
          Your resized images will be downloaded to your computer in a zip file.
        </p>
        <p className="text-sm">Maximum size per resize: 65 MB</p>
      </CardFooter>
    </Card>
  );
}
