import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Not Found</CardTitle>
          <CardDescription className="text-base">
            Could not find requested resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="text-white transition shadow-inner shadow-slate-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-neutral-700 hover:bg-neutral-800 focus:shadow-slate-600 border-neutral-700 hover:shadow-slate-600"
            href="/"
          >
            Return Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
