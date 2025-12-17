'use client';

import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar current="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl font-bold text-gray-300 mb-4">Error</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-4">
              An unexpected error has occurred on this page.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {error.message}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()}>Try again</Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
