'use client';

import React, { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Loader from '@/custom/loader/loader';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';

export default function BrochureLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [pageLoading, setPageLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

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
    
    // Simulate page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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

        {/* Main Content - No Navbar or Footer */}
        <main>
          {children}
        </main>
      </>
    </LanguageProvider>
  );
}
