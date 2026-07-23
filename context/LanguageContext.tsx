'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';

type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fa'); // Default to Persian as requested
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to sleek dark mode
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('ppt_language') as Language | null;
      const savedTheme = localStorage.getItem('ppt_theme') as Theme | null;

      if (savedLanguage) setLanguageState(savedLanguage);
      if (savedTheme) setThemeState(savedTheme);
    } catch {
      // ignore SSR/storage error
    }
    
    setMounted(true);
  }, []);

  // Update localStorage and apply theme when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ppt_language', lang);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    }
  };

  // Update localStorage and apply theme when theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ppt_theme', newTheme);
    } catch {}
    
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Set initial direction and theme on mount
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mounted, language, theme]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
