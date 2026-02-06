'use client';

import { useEffect, useState } from 'react';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';

export function useSchoolDetails() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
      }
    } catch (e) {
      // localStorage not available
    }
    setMounted(true);
  }, []);

  // Return appropriate school details based on language
  // Don't return anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return schoolDetails;
  }

  return language === 'hi' ? schoolDetailsHi : schoolDetails;
}
