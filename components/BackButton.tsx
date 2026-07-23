"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const BackButton: React.FC<{ label?: string; className?: string }> = ({ label, className }) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isRtl = language === "fa";

  const btnLabel = label || t("common.back", language);

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-gray-200 font-bold text-xs transition-all active:scale-95 border border-slate-200 dark:border-white/10 ${className || ""}`}
    >
      {isRtl ? (
        <ArrowRight className="w-4 h-4 text-indigo-500" />
      ) : (
        <ArrowLeft className="w-4 h-4 text-indigo-500" />
      )}
      <span>{btnLabel}</span>
    </button>
  );
};

export default BackButton;
