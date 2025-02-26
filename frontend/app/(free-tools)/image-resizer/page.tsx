import Image from 'next/image';
import ImageResizerForm from './_components/ImageResizerForm';

import catThinkingLight from '@/public/images/cat-thinking-light.png';
import catThinking from '@/public/images/cat-thinking.png';
import catPlantLight from '@/public/images/cat-plant-light.png';
import catPlant from '@/public/images/cat-plant.png';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer - Free Forever, No Ads!',
  description:
    'Resize your images in bulk, for free! Image Resizer is a free online service that allows you to resize images in bulk. With Image Resizer, you can easily resize all of your images in just a few clicks.',
  keywords:
    'Prebo Digital, online tools, image resizer, digital automation, free image tools, marketing tools',
  openGraph: {
    title: 'Image Resizer - Free Forever, No Ads!',
    description:
      'Resize your images in bulk, for free! Image Resizer is a free online service that allows you to resize images in bulk. With Image Resizer, you can easily resize all of your images in just a few clicks.',
    siteName: 'Prebo Digital Tools',
  },
};

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
    <div className="mb-8 md:my-8 ">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
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
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <Image
            src={catThinkingLight}
            alt="thinking cat"
            width={0}
            height={0}
            className="max-w-md hidden dark:block"
          />
          <Image
            src={catThinking}
            alt="thinking cat"
            width={0}
            height={0}
            className="max-w-md block dark:hidden"
          />
          <div className="max-w-[60ch]">
            <h2 className="text-2xl font-bold mb-2">How it works</h2>
            <h3 className="text-lg mb-2">
              Image Resizer is very easy to use. Just follow these simple steps:
            </h3>
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

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="max-w-[60ch]">
            <h2 className="text-2xl font-bold mb-2">Benefits</h2>
            <h3 className="text-lg mb-2">
              There are many benefits to using Image Resizer. Here are just a
              few:
            </h3>
            <ol className="list-inside list-decimal">
              <li>
                <span className="font-bold">Save time:</span> Image Resizer can
                save you a lot of time by automatically resizing all of your
                images for you.
              </li>
              <li>
                <span className="font-bold">Improve image quality:</span> Image
                Resizer uses high-quality algorithms to resize your images, so
                you can be sure that they will look great.
              </li>
              <li>
                <span className="font-bold">
                  Optimize your website for search engines:
                </span>{' '}
                By resizing your images, you can improve the loading speed of
                your website, which can help you rank higher in search engine
                results pages (SERPs).
              </li>
              <li>
                <span className="font-bold">Choose multiple formats:</span>
                Image Resizer allows you to choose multiple formats for your
                resized images, so you can choose the format that best suits
                your needs.
              </li>
              <li>
                <span className="font-bold">It&apos;s free!</span>
              </li>
            </ol>
          </div>
          <Image
            src={catPlantLight}
            alt="cat with a plant"
            width={0}
            height={0}
            className="max-w-md hidden dark:block"
          />
          <Image
            src={catPlant}
            alt="cat with a plant"
            width={0}
            height={0}
            className="max-w-md block dark:hidden"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full my-8">
        <div className="max-w-[60ch] text-left md:text-center mx-auto">
          <h2 className="text-2xl font-bold mb-2">Resize your images today!</h2>
          <p className="">
            If you&apos;re looking for a quick and easy way to resize your
            images, then Image Resizer is the perfect solution for you.
          </p>
          <p>
            With Image Resizer, you can easily resize all of your images in just
            a few clicks. So what are you waiting for?
          </p>
          <h3 className="text-xl my-2">Try Image Resizer today!</h3>
        </div>
      </div>
    </div>
  );
}
