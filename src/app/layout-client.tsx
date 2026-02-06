'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar/navbar';
import AdminNavbar from '@/admin/navbar/navbar';
import Footer from '@/components/footer/footer';
import Loader from '@/custom/loader/loader';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayoutClient({ 
  children 
}: { 
  children: ReactNode 
}) {
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    // Load language from localStorage on mount
    try {
      const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = 'en';
      }
    } catch (e) {
      // localStorage not available
      document.documentElement.lang = 'en';
    }
  }, []);

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language;
  }, [language]);

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
    <LanguageProvider>
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
    </LanguageProvider>
  );
}