"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { formatPersianDate } from "@/lib/persianDate";
import { calculateCashYieldMetrics } from "@/lib/interestUtils";
import { Coins, Clock, TrendingUp, Sparkles, CheckCircle2, ArrowRightLeft } from "lucide-react";

interface Props {
  accountId?: string; // Optional: if provided, filter for this account only
}

export const CashInterestCard: React.FC<Props> = ({ accountId }) => {
  const { accounts, records, cashInterests, settleCashInterest, currencyUnit } = useData();
  const { language } = useLanguage();

  const isRtl = language === "fa";
  const todayIso = new Date().toISOString().slice(0, 10);

  // Filter cash interests by accountId if specified
  const filteredItems = accountId
    ? cashInterests.filter((i) => i.account_id === accountId)
    : cashInterests;

  if (filteredItems.length === 0) {
    return null; // Don't show card if no cash yield is configured
  }

  return (
    <div className="glass-card p-5 space-y-4 overflow-hidden border-amber-500/20 dark:border-amber-500/20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t("interest.yieldCardTitle", language)}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              {t("interest.autoNotice", language)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const accountObj = accounts.find((a) => a.id === item.account_id);
          const accName = accountObj ? accountObj.name : item.title;
          const accountRecords = records.filter((r) => r.account_id === item.account_id);
          const metrics = calculateCashYieldMetrics(item, accountRecords, todayIso);

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-slate-100 dark:from-amber-500/10 dark:via-slate-900/60 dark:to-slate-900/90 border border-amber-500/20 dark:border-amber-500/20 space-y-3.5 relative overflow-hidden"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-200 block">
                    {accName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <span>موجودی نقد:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(metrics.currentCashBalance, language, currencyUnit)}
                    </strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs">
                    %{item.interest_rate} ({item.interest_period === "yearly" ? t("interest.yearly", language) : t("interest.monthly", language)})
                  </span>
                </div>
              </div>

              {/* Core Yield Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/80 backdrop-blur border border-slate-200/80 dark:border-white/10 text-center">
                {/* Days Remaining */}
                <div className="p-1.5 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 block mb-1">
                    {t("interest.daysRemaining", language)}
                  </span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{metrics.daysRemaining}</span>
                    <span className="text-[10px] font-normal">{isRtl ? "روز" : "d"}</span>
                  </span>
                </div>

                {/* Accrued Profit so far */}
                <div className="p-1.5 flex flex-col justify-center items-center border-x border-slate-200/60 dark:border-white/10">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 block mb-1">
                    {t("interest.accruedSoFar", language)}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(metrics.accruedProfit, language, currencyUnit)}
                  </span>
                </div>

                {/* Monthly Forecast */}
                <div className="p-1.5 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 block mb-1">
                    {t("interest.monthlyForecast", language)}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatCurrency(metrics.monthlyForecastProfit, language, currencyUnit)}
                  </span>
                </div>
              </div>

              {/* Footer / Action */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-gray-400">
                  تاریخ سررسید بعدی: <strong className="text-slate-700 dark:text-gray-300">{formatPersianDate(metrics.nextMaturityDate)}</strong>
                </span>

                {metrics.isDue ? (
                  <button
                    onClick={() => settleCashInterest(item.id, true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t("interest.depositAction", language)}</span>
                  </button>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400/80 font-medium text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    در حال محاسبه روزانه
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CashInterestCard;
