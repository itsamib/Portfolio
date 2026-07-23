"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CheckCircle2, LineChart, Sparkles, X } from "lucide-react";

const ONBOARDING_SEEN_KEY = "ppt_onboarding_seen";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen: overrideOpen, onClose }) => {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  const isRtl = language === "fa";

  useEffect(() => {
    if (overrideOpen !== undefined) {
      setShow(overrideOpen);
      return;
    }

    try {
      const seen = localStorage.getItem(ONBOARDING_SEEN_KEY);
      if (!seen) {
        setShow(true);
      }
    } catch {
      // ignore SSR error
    }
  }, [overrideOpen]);

  const handleFinish = () => {
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    } catch {}
    setShow(false);
    if (onClose) onClose();
  };

  if (!show) return null;

  const features = [
    {
      title: t("splash.feature1Title", language),
      desc: t("splash.feature1Desc", language),
    },
    {
      title: t("splash.feature2Title", language),
      desc: t("splash.feature2Desc", language),
    },
    {
      title: t("splash.feature3Title", language),
      desc: t("splash.feature3Desc", language),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glow & Close Button */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        <button
          onClick={handleFinish}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/5 transition-colors"
          title={t("splash.skip", language)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-center sm:text-start">
          {/* App Icon Banner */}
          <div className="flex flex-col items-center sm:items-start gap-4 pt-2">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/30 group">
              <Image
                src="/icon.jpg"
                alt="App Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === "fa" ? "نسخه ۱.۰ پورتفولیو" : "Portfolio v1.0"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {t("splash.title", language)}
              </h2>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                {t("splash.subtitle", language)}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
            {t("splash.desc", language)}
          </p>

          {/* Features Checklist */}
          <div className="space-y-3 pt-2">
            {features.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start gap-3 text-start"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-gray-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleFinish}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white px-3 py-2 transition-colors order-2 sm:order-1"
          >
            {t("splash.skip", language)}
          </button>

          <button
            onClick={handleFinish}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <span>{t("splash.start", language)}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
