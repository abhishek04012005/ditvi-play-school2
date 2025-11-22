'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar/navbar';
import AdminNavbar from '@/admin/navbar/navbar';
import Footer from '@/components/footer/footer';
import Loader from '@/custom/loader/loader';
import { Toaster } from 'react-hot-toast';

export default function RootLayoutClient({ 
  children 
}: { 
  children: ReactNode 
}) {
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    // Show loader on initial load
    setPageLoading(true);
    
    // Simulate page load - adjust timing as needed
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Global Page Loader */}
      <Loader 
        isVisible={pageLoading} 
        message="Loading..." 
        fullScreen={true} 
      />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
      />

      {/* Admin Navbar - Only on /admin/* routes */}
      {isAdminRoute && <AdminNavbar />}

      {/* Public Navbar - Only on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer - Only on non-admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
}