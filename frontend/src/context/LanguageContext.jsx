import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import bn from '../locales/bn.json';

const translations = { en, bn };
const STORAGE_KEY = 'agrishift_language';
const PAGE_TITLES = {
  en: 'AgriShift — Crop Rotation Decision Support Tool in Saline Coastal Lands',
  bn: 'AgriShift — লবণাক্ত উপকূলীয় অঞ্চলে ফসল পর্যায়ক্রম সিদ্ধান্ত-সহায়তা'
};

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Requirement 4: Default to Bangla for the initial farmer-focused experience,
  // unless a language preference is already saved.
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'bn') {
        return saved;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return 'bn';
  });

  const setLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'bn') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.warn('Failed to save language to localStorage', e);
      }
      document.documentElement.lang = lang;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = PAGE_TITLES[language];
  }, [language]);

  /**
   * Helper function to retrieve nested translation keys.
   * e.g., t('home.heroTitle')
   */
  const t = useCallback((keyPath, defaultText = '') => {
    if (!keyPath) return defaultText;
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if missing in selected language
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return defaultText || keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : defaultText || keyPath;
      }
    }

    return typeof current === 'string' ? current : defaultText || keyPath;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    isBangla: language === 'bn'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
