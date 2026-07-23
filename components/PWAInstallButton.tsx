"use client";

import React, { useState, useEffect } from "react";
import { Download, CheckCircle, Smartphone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

export const PWAInstallButton: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        title={t("pwa.installed", language)}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{t("pwa.installed", language)}</span>
      </div>
    );
  }

  if (!deferredPrompt) {
    // Return null or discreet shortcut badge if standard browser doesn't expose prompt yet
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/20 transition-all"
      title={t("pwa.tooltip", language)}
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>{t("pwa.install", language)}</span>
    </button>
  );
};

export default PWAInstallButton;
