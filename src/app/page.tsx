'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-2xl">A</span>
        </div>
      </div>
    </div>
  );
}
