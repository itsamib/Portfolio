"use client";

import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { toPersianDate, jalaliToIso, formatPersianDate } from "@/lib/persianDate";
import { Coins, Calendar, Plus, Trash2, Percent, DollarSign } from "lucide-react";

export const CashInterestManager: React.FC = () => {
  const { accounts, cashInterests, addCashInterest, deleteCashInterest, currencyUnit } = useData();
  const { language } = useLanguage();

  const isRtl = language === "fa";

  const todayIso = new Date().toISOString().slice(0, 10);
  const [accountId, setAccountId] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestPeriod, setInterestPeriod] = useState<"yearly" | "monthly">("yearly");
  const [maturityDate, setMaturityDate] = useState(todayIso);
  const [jalaliInput, setJalaliInput] = useState(toPersianDate(todayIso));
  const [error, setError] = useState<string | null>(null);

  const handleGregorianChange = (iso: string) => {
    setMaturityDate(iso);
    setJalaliInput(toPersianDate(iso));
  };

  const handleJalaliChange = (val: string) => {
    setJalaliInput(val);
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(val)) {
      const iso = jalaliToIso(val);
      setMaturityDate(iso);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accountId) {
      setError(isRtl ? "لطفاً یک حساب انتخاب کنید." : "Please select an account.");
      return;
    }

    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);

    if (isNaN(principal) || principal <= 0 || isNaN(rate) || rate <= 0) {
      setError(isRtl ? "مبلغ و درصد سود باید اعداد معتبر و بزرگتر از صفر باشند." : "Please enter valid principal and rate.");
      return;
    }

    const accountObj = accounts.find((a) => a.id === accountId);
    const title = accountObj ? accountObj.name : "حساب وجه نقد";

    addCashInterest({
      account_id: accountId,
      title,
      principal_amount: principal,
      interest_rate: rate,
      interest_period: interestPeriod,
      maturity_date: maturityDate,
    });

    // Reset form
    setPrincipalAmount("");
    setInterestRate("");
    setError(null);
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t("interest.title", language)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">
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

          {/* Principal Cash Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("interest.principal", language)}
            </label>
            <input
              type="number"
              step="any"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              className="glass-input"
              placeholder="1000000"
              required
            />
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
                placeholder="20"
                required
              />
              <select
                value={interestPeriod}
                onChange={(e) => setInterestPeriod(e.target.value as "yearly" | "monthly")}
                className="glass-input flex-1"
              >
                <option value="yearly" className="dark:bg-gray-900">{t("interest.yearly", language)}</option>
                <option value="monthly" className="dark:bg-gray-900">{t("interest.monthly", language)}</option>
              </select>
            </div>
          </div>

          {/* Maturity Date (Dual Gregorian & Jalali) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
              {t("interest.maturityDate", language)}
            </label>
            <input
              type="date"
              value={maturityDate}
              onChange={(e) => handleGregorianChange(e.target.value)}
              className="glass-input"
              required
            />
            <input
              type="text"
              value={jalaliInput}
              onChange={(e) => handleJalaliChange(e.target.value)}
              placeholder="1405/05/01"
              className="glass-input mt-1 text-xs"
              title="تاریخ شمسی سررسید"
            />
          </div>

          {/* Submit */}
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

      {/* List of active Cash Interest schedules */}
      {cashInterests.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300">
            {isRtl ? "سررسیدهای سود فعال ثبت‌شده:" : "Scheduled Cash Interests:"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cashInterests.map((item) => {
              const accountObj = accounts.find((a) => a.id === item.account_id);
              const accName = accountObj ? accountObj.name : item.title;
              const calcProfit = item.principal_amount * (item.interest_rate / 100);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <span>{accName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        %{item.interest_rate} ({item.interest_period === "yearly" ? t("interest.yearly", language) : t("interest.monthly", language)})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-[11px]">
                      <span>سررسید: {formatPersianDate(item.maturity_date)}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        سود: {formatCurrency(calcProfit, language, currencyUnit)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCashInterest(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors"
                    title="حذف سررسید سود"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
