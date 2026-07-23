"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { Moon, Sun } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";

export const Header: React.FC = () => {
  const { language, theme, setTheme } = useLanguage();
  const [isRotating, setIsRotating] = useState(false);

  const toggleTheme = () => {
    setIsRotating(true);
    setTheme(theme === "light" ? "dark" : "light");
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo & Short Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("header.title", language)}
            </h1>
          </div>

          {/* Minimal Controls: Theme Toggle & Hamburger Drawer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Sun #FDB813 / Moon #C0C0C0) with rotation animation */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 border border-slate-200 dark:border-gray-700/60 transition-all active:scale-95 flex items-center justify-center"
              title={theme === "light" ? t("header.darkMode", language) : t("header.lightMode", language)}
              aria-label="Toggle Theme"
            >
              <div
                className={`transition-transform duration-500 ease-in-out ${
                  isRotating ? "rotate-180" : "rotate-0"
                }`}
              >
                {theme === "light" ? (
                  <Sun className="w-5 h-5 text-[#FDB813] fill-[#FDB813]/20" />
                ) : (
                  <Moon className="w-5 h-5 text-[#C0C0C0] fill-[#C0C0C0]/20" />
                )}
              </div>
            </button>

            {/* Hamburger Drawer Menu Button ☰ */}
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
