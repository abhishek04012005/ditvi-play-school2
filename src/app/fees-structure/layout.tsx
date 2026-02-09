'use client';

import React, { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Loader from '@/custom/loader/loader';
import { Toaster } from 'react-hot-toast';

export default function FeesStructureLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Show loader on initial load
    setPageLoading(true);

    // Simulate page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Loader isVisible={pageLoading} message="Loading Fee Structure..." fullScreen={true} />
      <Toaster position="top-right" />
      {/* No navbar or footer - just the content */}
      {children}
    </>
  );
}
