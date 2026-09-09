import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../utils/translations';

export const LanguageContext = createContext(null);

const STORAGE_KEY = 'feedcheck_lang';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' }
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch (e) {}
    }
  };

  /**
   * Translates a dot-notated key string (e.g., 'nav.home', 'home.hero_title').
   * Falls back to English, or returns key if not found.
   */
  const t = (key, fallback = '') => {
    if (!key) return fallback;
    const parts = key.split('.');
    
    // 1. Try current language
    let cur = TRANSLATIONS[language];
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        cur = null;
        break;
      }
    }
    if (typeof cur === 'string') return cur;

    // 2. Fallback to English
    let enCur = TRANSLATIONS.en;
    for (const p of parts) {
      if (enCur && typeof enCur === 'object' && p in enCur) {
        enCur = enCur[p];
      } else {
        enCur = null;
        break;
      }
    }
    if (typeof enCur === 'string') return enCur;

    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
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

export default LanguageContext;
