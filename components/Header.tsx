'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { Moon, Sun, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, theme, setTheme } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('header.title', language)}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 px-3 py-2 rounded font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={t('header.language', language)}
              >
                <Globe size={18} />
                <span className="hidden sm:inline">EN</span>
              </button>
              <button
                onClick={() => setLanguage('fa')}
                className={`flex items-center gap-1 px-3 py-2 rounded font-medium transition-colors ${
                  language === 'fa'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={t('header.language', language)}
              >
                <Globe size={18} />
                <span className="hidden sm:inline">FA</span>
              </button>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  theme === 'light'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={t('header.lightMode', language)}
              >
                <Sun size={18} />
                <span className="hidden sm:inline text-sm">{t('header.lightMode', language)}</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={t('header.darkMode', language)}
              >
                <Moon size={18} />
                <span className="hidden sm:inline text-sm">{t('header.darkMode', language)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
