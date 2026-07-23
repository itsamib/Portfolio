"use client";

import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { formatPersianDate } from "@/lib/persianDate";
import { Bell, CheckCircle2, XCircle, Calendar, DollarSign, Percent, Sparkles } from "lucide-react";

export const CashInterestMaturityModal: React.FC = () => {
  const { dueCashInterests, settleCashInterest, accounts, currencyUnit } = useData();
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isRtl = language === "fa";

  if (!dueCashInterests || dueCashInterests.length === 0) return null;

  const currentItem = dueCashInterests[currentIndex] || dueCashInterests[0];
  if (!currentItem) return null;

  const accountObj = accounts.find((a) => a.id === currentItem.account_id);
  const accountName = accountObj ? accountObj.name : currentItem.title || "حساب وجه نقد";

  // Calculate profit amount
  const profitAmount =
    currentItem.interest_period === "monthly"
      ? currentItem.principal_amount * (currentItem.interest_rate / 100)
      : currentItem.principal_amount * (currentItem.interest_rate / 100);

  const handleAction = (deposit: boolean) => {
    settleCashInterest(currentItem.id, deposit);
    if (currentIndex >= dueCashInterests.length - 1) {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

        <div className="flex items-center gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 animate-bounce">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t("interest.popupTitle", language)}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              {t("interest.popupDesc", language)}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t("dataEntry.account", language)}:</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{accountName}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("interest.rate", language)} ({currentItem.interest_period === "yearly" ? t("interest.yearly", language) : t("interest.monthly", language)}):</span>
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">% {currentItem.interest_rate}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t("interest.maturityDate", language)}:</span>
            </span>
            <span className="font-medium text-slate-700 dark:text-gray-300">
              {formatPersianDate(currentItem.maturity_date)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{t("interest.calcAmount", language)}:</span>
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(profitAmount, language, currencyUnit)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleAction(true)}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t("interest.depositAction", language)}</span>
          </button>

          <button
            onClick={() => handleAction(false)}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 active:scale-95 text-slate-700 dark:text-gray-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>{t("interest.skipAction", language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashInterestMaturityModal;
