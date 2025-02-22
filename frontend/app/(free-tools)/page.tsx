import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">Welcome to Prebo Digital Tools</h1>
      {session ? (
        <p className="mt-4">
          Welcome, {session?.user?.email}! Here you can access all the internal
          tools.
        </p>
      ) : (
        <p className="mt-4">
          Access our internal tools after logging in. Some free tools are also
          availble.
        </p>
      )}

      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card className="w-full max-w-sm flex flex-col justify-between relative overflow-hidden">
            <CardHeader>
              {!session && (
                <span className="absolute top-8 -right-20 rotate-45 text-sm bg-sky-500 w-60">
                  Requires Sign In
                </span>
              )}
              <CardTitle className="text-xl">AI Feed Optimiser</CardTitle>
              <CardDescription>
                Optimize your website&apos;s product feed for Google Merchant
                Center.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className="text-white transition shadow-inner shadow-zinc-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-gray-700 hover:bg-gray-800 focus:shadow-zinc-600 border-gray-700 hover:shadow-zinc-600"
                href="/feed-optimiser"
              >
                Optimise Now
              </Link>
            </CardContent>
          </Card>

          <Card className="w-full max-w-sm flex flex-col justify-between relative overflow-hidden">
            <CardHeader>
              {!session && (
                <span className="absolute top-8 -right-20 rotate-45 text-sm bg-sky-500 w-60">
                  Requires Sign In
                </span>
              )}
              <CardTitle className="text-xl">SEO Analyser</CardTitle>
              <CardDescription>
                Optimise your pages for maximum visibility with ease.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className="text-white transition shadow-inner shadow-zinc-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-gray-700 hover:bg-gray-800 focus:shadow-zinc-600 border-gray-700 hover:shadow-zinc-600"
                href="/seo-analysis"
              >
                Analyse Now
              </Link>
            </CardContent>
          </Card>

          <Card className="w-full max-w-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Image Resizer</CardTitle>
              <CardDescription>
                Resize your images for your website or social media in many
                formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="w-fit m-auto text-white transition shadow-inner shadow-zinc-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-gray-800 border-gray-700">
                Coming Soon!
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
