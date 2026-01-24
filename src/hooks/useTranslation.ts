'use client';

import { useLanguageContext } from '@/context/LanguageContext';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';

type Language = 'en' | 'hi';

const translations: Record<Language, any> = {
  en,
  hi,
};

export function useTranslation() {
  const { language, switchLanguage } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations['en'];
        for (const fallbackK of keys) {
          if (value && typeof value === 'object' && fallbackK in value) {
            value = value[fallbackK];
          } else {
            return key; // Return key if not found
          }
        }
        return value;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language, switchLanguage };
}
