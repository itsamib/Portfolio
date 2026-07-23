"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { t } from "@/lib/i18n";
import { CurrencyUnit } from "@/lib/types";
import {
  Menu,
  X,
  Globe,
  FileJson,
  HelpCircle,
  Smartphone,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Home,
  PlusCircle,
  Users,
  Compass,
  Coins,
} from "lucide-react";
import BackupModal from "@/components/BackupModal";
import OnboardingModal from "@/components/OnboardingModal";
import PWAInstallButton from "@/components/PWAInstallButton";

export const HamburgerMenu: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { currencyUnit, setCurrencyUnit } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRtl = language === "fa";
  const closeDrawer = () => setIsOpen(false);

  const navItems = [
    { href: "/", label: t("nav.dashboard", language), icon: Home },
    { href: "/data-entry", label: t("nav.dataEntry", language), icon: PlusCircle },
    { href: "/accounts", label: t("nav.accounts", language), icon: Users },
  ];

  const currencyOptions: { unit: CurrencyUnit; labelKey: string }[] = [
    { unit: "toman", labelKey: "currency.toman" },
    { unit: "rial", labelKey: "currency.rial" },
    { unit: "million_toman", labelKey: "currency.millionToman" },
    { unit: "usd", labelKey: "currency.usd" },
  ];

  const drawerPortal = mounted
    ? ReactDOM.createPortal(
        <>
          {/* Overlay Backdrop */}
          {isOpen && (
            <div
              onClick={closeDrawer}
              className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            />
          )}

          {/* Full-Height Sliding Drawer */}
          <div
            className={`fixed top-0 bottom-0 z-[1000] w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-l dark:border-white/10 shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between overflow-hidden ${
              isRtl ? "left-0 border-r" : "right-0 border-l"
            } ${isOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full"}`}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-amber-400/40 shrink-0">
                  <Image
                    src="/icon.jpg"
                    alt="Logo"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t("menu.title", language)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {t("header.title", language)}
                  </p>
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Items */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Navigation Pages */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isRtl ? "صفحات اصلی" : "Pages"}</span>
                </label>
                <div className="flex flex-col gap-1.5">
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeDrawer}
                        className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all ${
                          isActive
                            ? "bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm"
                            : "text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Currency Unit Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t("currency.unit", language)}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-gray-700/60">
                  {currencyOptions.map(({ unit, labelKey }) => (
                    <button
                      key={unit}
                      onClick={() => setCurrencyUnit(unit)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center text-center ${
                        currencyUnit === unit
                          ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm"
                          : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <span>{t(labelKey, language)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t("menu.language", language)}</span>
                </label>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-gray-700/60">
                  <button
                    onClick={() => setLanguage("fa")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      language === "fa"
                        ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>فارسی (FA)</span>
                  </button>

                  <button
                    onClick={() => setLanguage("en")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      language === "en"
                        ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>English (EN)</span>
                  </button>
                </div>
              </div>

              {/* Quick Menu Actions */}
              <div className="space-y-2">
                {/* Backup & Restore */}
                <button
                  onClick={() => {
                    closeDrawer();
                    setIsBackupOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-100 flex items-center justify-between text-xs font-bold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <span>{t("menu.backup", language)}</span>
                  </div>
                  {isRtl ? (
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* Onboarding Guide */}
                <button
                  onClick={() => {
                    closeDrawer();
                    setIsOnboardingOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-100 flex items-center justify-between text-xs font-bold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>{t("menu.onboarding", language)}</span>
                  </div>
                  {isRtl ? (
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* Install App (PWA) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-100">
                      {t("menu.installPwa", language)}
                    </span>
                  </div>
                  <PWAInstallButton />
                </div>

                {/* About App */}
                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-100 flex items-center justify-between text-xs font-bold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Info className="w-4 h-4" />
                    </div>
                    <span>{t("menu.about", language)}</span>
                  </div>
                  {isRtl ? (
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-white/10 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t("app.footerNote", language)}</span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {/* Hamburger Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700/60 transition-all active:scale-95 flex items-center justify-center"
        aria-label={t("menu.title", language)}
        title={t("menu.title", language)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Render Portal Drawer */}
      {drawerPortal}

      {/* Modals triggered from Hamburger */}
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/30">
                <Image
                  src="/icon.jpg"
                  alt="App Icon"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {t("header.title", language)}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  <Sparkles className="w-3 h-3" />
                  {t("about.version", language)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed text-center">
              {t("about.desc", language)}
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                <span>{isRtl ? "پشتیبانی تقویم:" : "Calendar Support:"}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {isRtl ? "شمسی و میلادی" : "Jalali & Gregorian"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                <span>{isRtl ? "تحلیل سود:" : "Profit Analysis:"}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {isRtl ? "۶ بازه زمانی" : "6 Timeframes"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                <span>{isRtl ? "حفظ حریم خصوصی:" : "Privacy:"}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {isRtl ? "۱۰۰٪ محلی (Local)" : "100% Offline / Local"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAboutOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {isRtl ? "بستن" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;
