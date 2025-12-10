'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/document-dashboard');
  }, [router]);

  return null;
}

