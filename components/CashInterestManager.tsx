"use client";

import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { formatPersianDate } from "@/lib/persianDate";
import { calculateCashYieldMetrics } from "@/lib/interestUtils";
import { Coins, Plus, Trash2, Calendar, Sparkles, Clock, ArrowUpRight } from "lucide-react";

export const CashInterestManager: React.FC = () => {
  const { accounts, records, cashInterests, addCashInterest, deleteCashInterest, currencyUnit } = useData();
  const { language } = useLanguage();

  const isRtl = language === "fa";
  const todayIso = new Date().toISOString().slice(0, 10);

  const [accountId, setAccountId] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestPeriod, setInterestPeriod] = useState<"yearly" | "monthly">("yearly");
  const [maturityDay, setMaturityDay] = useState<number>(1);
  const [startDate, setStartDate] = useState(todayIso);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accountId) {
      setError(isRtl ? "لطفاً یک حساب انتخاب کنید." : "Please select an account.");
      return;
    }

    const rate = parseFloat(interestRate);
    if (isNaN(rate) || rate <= 0) {
      setError(isRtl ? "درصد سود باید یک عدد معتبر و بزرگتر از صفر باشد." : "Please enter a valid interest rate.");
      return;
    }

    const accountObj = accounts.find((a) => a.id === accountId);
    const title = accountObj ? accountObj.name : "حساب وجه نقد";

    addCashInterest({
      account_id: accountId,
      title,
      interest_rate: rate,
      interest_period: interestPeriod,
      maturity_day: Math.min(31, Math.max(1, maturityDay)),
      last_settlement_date: startDate,
    });

    // Reset rate input
    setInterestRate("");
    setError(null);
  };

  return (
    <div className="glass-card p-5 space-y-5 overflow-hidden">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t("interest.title", language)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            {t("interest.subtitle", language)}
          </p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t("dataEntry.noAccountNotice", language)}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Account */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("dataEntry.account", language)}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="glass-input"
              required
            >
              <option value="" disabled className="dark:bg-gray-900">
                {t("dataEntry.selectAccount", language)}
              </option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="dark:bg-gray-900">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interest Rate & Period */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("interest.rate", language)} (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="glass-input w-24 shrink-0"
                placeholder="22.5"
                required
              />
              <select
                value={interestPeriod}
                onChange={(e) => setInterestPeriod(e.target.value as "yearly" | "monthly")}
                className="glass-input flex-1 text-xs"
              >
                <option value="yearly" className="dark:bg-gray-900">{t("interest.yearly", language)}</option>
                <option value="monthly" className="dark:bg-gray-900">{t("interest.monthly", language)}</option>
              </select>
            </div>
          </div>

          {/* Monthly Maturity Day (1 to 31) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("interest.maturityDay", language)}
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={maturityDay}
              onChange={(e) => setMaturityDay(parseInt(e.target.value) || 1)}
              className="glass-input"
              placeholder="1"
              required
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("interest.lastSettlement", language)}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="glass-button w-full h-[42px] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("interest.add", language)}</span>
            </button>
          </div>

          {error && <p className="col-span-full text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </form>
      )}

      {/* List of Active Cash Deposit Interest Settings */}
      {cashInterests.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? "تنظیمات سود وجه نقد و محاسبه روزانه:" : "Active Cash Yield Settings:"}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cashInterests.map((item) => {
              const accountObj = accounts.find((a) => a.id === item.account_id);
              const accName = accountObj ? accountObj.name : item.title;
              const accountRecords = records.filter((r) => r.account_id === item.account_id);
              const metrics = calculateCashYieldMetrics(item, accountRecords, todayIso);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {accName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        %{item.interest_rate} ({item.interest_period === "yearly" ? t("interest.yearly", language) : t("interest.monthly", language)})
                      </span>
                    </div>

                    <button
                      onClick={() => deleteCashInterest(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors"
                      title="حذف تنظیمات سود"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Daily Accrual & Forecast Stats */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 block">
                        {t("interest.accruedSoFar", language)}
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatCurrency(metrics.accruedProfit, language, currencyUnit)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 block">
                        {t("interest.daysRemaining", language)}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{metrics.daysRemaining} {isRtl ? "روز" : "days"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
                    <span>سررسید بعدی: {formatPersianDate(metrics.nextMaturityDate)}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      پیش‌بینی: {formatCurrency(metrics.monthlyForecastProfit, language, currencyUnit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashInterestManager;
