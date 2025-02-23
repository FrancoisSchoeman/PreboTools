import Image from 'next/image';
import ImageResizerForm from './_components/ImageResizerForm';

import catThinkingLight from '@/public/images/cat-thinking-light.png';

// TODO: Complete page content, add all images and themes, add to menu
export default async function ImageResizerPage() {
  const apiURL = `${process.env.BACKEND_URL}/api/image-resizer/count`;

  const res = await fetch(apiURL, {
    headers: {
      'X-API-Key': process.env.INTERNAL_API_KEY!,
    },
  });

  let count = 0;

  if (res.ok) {
    const data = await res.json();
    count = data.count;
  }

  return (
    <div className="mb-8 md:my-8 flex items-center justify-center">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="max-w-[60ch]">
            <h1 className="text-3xl font-bold mb-6">
              Resize your images in bulk, for free!
            </h1>
            <p className="">
              Image Resizer is a free online service that allows you to resize
              images in bulk. With Image Resizer, you can easily resize all of
              your images in just a few clicks.
            </p>
          </div>
          <ImageResizerForm count={count} />
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Image
            src={catThinkingLight}
            alt="cat-thinking"
            width={0}
            height={0}
            className="max-w-md"
          />
          <div className="max-w-[60ch]">
            <h2 className="text-2xl font-bold mb-6">How it works</h2>
            <p className="">
              Image Resizer is very easy to use. Just follow these simple steps:
            </p>
            <ol className="list-inside list-decimal">
              <li>Upload your images to Image Resizer.</li>
              <li>Select the desired width of your images.</li>
              <li>
                Select the desired output formats for your resized images.
              </li>
              <li>
                Choose whether you want a custom name for your resized images.
              </li>
              <li>Click on the &quot;Resize&quot; button.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
