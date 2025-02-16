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
        <p className="mt-4">Access our internal tools after logging in.</p>
      )}

      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Available Tools</h2>
        <div className="flex flex-wrap justify-center gap-4 text-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
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
        </div>
      </div>
    </div>
  );
}
