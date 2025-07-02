"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrafficShapingIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/traffic-shaping/layer3');
  }, [router]);
  return (
    <div className="flex items-center justify-center h-40 text-gray-500">Redirecting to Layer 3 Rules...</div>
  );
} 