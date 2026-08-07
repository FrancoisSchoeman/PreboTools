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
  const [imgFormat, setImgFormat] = useState('jpeg');
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/image-resizer', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let message = 'Error when resizing images. Please try again.';
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch {
          // ignore JSON parse errors
        }
        toast({ title: message, variant: 'destructive' });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resized_images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Images Resized Successfully!' });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error when resizing images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
              accept=".jpeg,.jpg,.png,.webp,.gif,.bmp,.tiff,.tif"
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
              min={1}
              max={10000}
              placeholder='e.g. "1920"'
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="img-format">
              Select format to convert images into
            </Label>
            <input type="hidden" name="img-format" value={imgFormat} />
            <Select value={imgFormat} onValueChange={setImgFormat}>
              <SelectTrigger id="img-format">
                <SelectValue placeholder="Image Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="bmp">BMP</SelectItem>
                <SelectItem value="tiff">TIFF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex gap-4">
            <Switch
              name="use-custom-name"
              id="use-custom-name"
              checked={useCustomName}
              onCheckedChange={setUseCustomName}
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
            <Button type="submit" disabled={isSubmitting}>
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
