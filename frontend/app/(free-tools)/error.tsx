'use client';

import { useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Something Went Wrong!</CardTitle>
          <CardDescription className="text-base">
            {error.digest && <p>Error ID: {error.digest}</p>}
            {error.message && <p>Error Message: {error.message}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="text-white transition shadow-inner shadow-slate-950 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 bg-neutral-700 hover:bg-neutral-800 focus:shadow-slate-600 border-neutral-700 hover:shadow-slate-600"
            onClick={reset}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
