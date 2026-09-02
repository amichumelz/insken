'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckinPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] text-white text-xs">
      Memindahkan ke Portal Utama...
    </div>
  );
}
