'use client';

import { useState, useEffect } from 'react';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
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

  const switchLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    try {
      localStorage.setItem('language', lang);
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      // Update HTML dir attribute if needed (Hindi is still LTR but good practice)
      document.documentElement.dir = 'ltr';
    } catch (e) {
      // localStorage not available
    }
    // Force page reload to apply translations and fonts
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => switchLanguage('en')}
        aria-label="Switch to English"
        title="English"
      >
        EN
      </button>
      <span className={styles.separator}>|</span>
      <button
        className={`${styles.toggleButton} ${language === 'hi' ? styles.active : ''}`}
        onClick={() => switchLanguage('hi')}
        aria-label="हिन्दी में स्विच करें"
        title="हिन्दी"
      >
        हिन्दी
      </button>
    </div>
  );
}
