"use client";

import { FormEvent, useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import DataTable, { DataTableColumn } from "@/components/DataTable";
import BackButton from "@/components/BackButton";
import CashInterestManager from "@/components/CashInterestManager";
import FormattedNumberInput from "@/components/FormattedNumberInput";
import CashFlowInput from "@/components/CashFlowInput";
import { PortfolioRecord } from "@/lib/types";
import { t, formatCurrency } from "@/lib/i18n";
import { toPersianDate, formatPersianDate, jalaliToIso } from "@/lib/persianDate";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DataEntryPage() {
  const { accounts, records, addRecord, editRecord, deleteRecord, currencyUnit } = useData();
  const { language } = useLanguage();

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [date, setDate] = useState(todayIso());
  const [jalaliDateInput, setJalaliDateInput] = useState(toPersianDate(todayIso()));
  const [accountId, setAccountId] = useState("");
  const [portfolioValue, setPortfolioValue] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [netCashFlow, setNetCashFlow] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  const isRtl = language === "fa";

  const nameMap = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) => b.date.localeCompare(a.date) || a.account_id.localeCompare(b.account_id)
      ),
    [records]
  );

  const persianDateDisplay = useMemo(() => {
    if (!date) return "";
    return formatPersianDate(date);
  }, [date]);

  function handleGregorianDateChange(isoVal: string) {
    setDate(isoVal);
    if (isoVal) {
      setJalaliDateInput(toPersianDate(isoVal));
    }
  }

  function handleJalaliInput(jalaliStr: string) {
    setJalaliDateInput(jalaliStr);
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(jalaliStr)) {
      const iso = jalaliToIso(jalaliStr);
      setDate(iso);
    }
  }

  function resetForm() {
    const today = todayIso();
    setDate(today);
    setJalaliDateInput(toPersianDate(today));
    setPortfolioValue("");
    setCashBalance("");
    setNetCashFlow("0");
    setEditingRecordId(null);
  }

  function handleStartEdit(r: PortfolioRecord) {
    setEditingRecordId(r.id);
    setDate(r.date);
    setJalaliDateInput(toPersianDate(r.date));
    setAccountId(r.account_id);
    setPortfolioValue(String(r.portfolio_value));
    setCashBalance(String(r.cash_balance));
    setNetCashFlow(String(r.net_cash_flow));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!accountId) {
      setFormError(t("dataEntry.selectAccountError", language));
      return;
    }
    const pv = parseFloat(portfolioValue);
    const cb = parseFloat(cashBalance);
    const ncf = parseFloat(netCashFlow || "0");

    if (Number.isNaN(pv) || Number.isNaN(cb) || Number.isNaN(ncf)) {
      setFormError(t("dataEntry.validationError", language));
      return;
    }

    if (editingRecordId) {
      editRecord(editingRecordId, {
        date,
        account_id: accountId,
        portfolio_value: pv,
        cash_balance: cb,
        net_cash_flow: ncf,
      });
    } else {
      addRecord({
        date,
        account_id: accountId,
        portfolio_value: pv,
        cash_balance: cb,
        net_cash_flow: ncf,
      });
    }
    resetForm();
  }

  const columns: DataTableColumn<PortfolioRecord>[] = [
    {
      key: "jalaliDate",
      header: t("table.jalaliDate", language),
      render: (r) => (
        <span className="font-medium text-indigo-600 dark:text-indigo-300">
          {toPersianDate(r.date)}
        </span>
      ),
    },
    {
      key: "date",
      header: t("table.date", language),
      render: (r) => <span className="text-slate-500 dark:text-gray-400">{r.date}</span>,
    },
    {
      key: "account",
      header: t("table.account", language),
      render: (r) => nameMap[r.account_id] ?? "حساب نامشخص",
    },
    {
      key: "portfolio_value",
      header: t("table.portfolioValue", language),
      align: "right",
      render: (r) => formatCurrency(r.portfolio_value, language, currencyUnit),
    },
    {
      key: "cash_balance",
      header: t("table.cashBalance", language),
      align: "right",
      render: (r) => formatCurrency(r.cash_balance, language, currencyUnit),
    },
    {
      key: "net_cash_flow",
      header: t("table.netCashFlow", language),
      align: "right",
      render: (r) => (
        <span className={r.net_cash_flow < 0 ? "text-rose-600 dark:text-rose-400 font-medium" : ""}>
          {formatCurrency(r.net_cash_flow, language, currencyUnit)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t("dataEntry.title", language)}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {t("dataEntry.subtitle", language)}
          </p>
        </div>
        <div>
          <BackButton />
        </div>
      </div>

      {/* Main Record Data Entry Form */}
      <form onSubmit={handleSubmit} className="glass-card p-5 flex flex-col gap-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t("dataEntry.noAccountNotice", language)}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Date Inputs (Gregorian & Jalali) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
                  {t("dataEntry.date", language)}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleGregorianDateChange(e.target.value)}
                  className="glass-input"
                  required
                />
                <input
                  type="text"
                  value={jalaliDateInput}
                  onChange={(e) => handleJalaliInput(e.target.value)}
                  placeholder="1405/05/01"
                  className="glass-input mt-1 text-xs"
                  title="تاریخ شمسی"
                />
                {persianDateDisplay && (
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    {isRtl ? `نمایش: ${persianDateDisplay}` : `Jalali: ${persianDateDisplay}`}
                  </span>
                )}
              </div>

              {/* Account Selection */}
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

              {/* Portfolio Value */}
              <FormattedNumberInput
                label={t("dataEntry.portfolioValue", language)}
                value={portfolioValue}
                onChange={setPortfolioValue}
                placeholder="0"
                required
              />

              {/* Cash Balance */}
              <FormattedNumberInput
                label={t("dataEntry.cashBalance", language)}
                value={cashBalance}
                onChange={setCashBalance}
                placeholder="0"
                required
              />

              {/* Net Cash Flow (Deposit / Withdrawal selector) */}
              <div className="col-span-1 md:col-span-2">
                <CashFlowInput
                  label={t("dataEntry.netCashFlow", language)}
                  value={netCashFlow}
                  onChange={setNetCashFlow}
                />
              </div>
            </div>

            {formError && <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>}

            <div className="flex items-center gap-2">
              <button type="submit" className="glass-button">
                {editingRecordId
                  ? isRtl
                    ? "ویرایش و بروزرسانی رکورد"
                    : "Update Record"
                  : t("dataEntry.addRecord", language)}
              </button>
              {editingRecordId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm rounded-xl font-medium border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {isRtl ? "لغو ویرایش" : "Cancel"}
                </button>
              )}
            </div>
          </>
        )}
      </form>

      {/* Cash Interest & Maturity Management Section */}
      <CashInterestManager />

      {/* Data Records Table */}
      <DataTable
        columns={columns}
        rows={sortedRecords}
        getRowId={(r) => r.id}
        onEdit={(r) => handleStartEdit(r)}
        onDelete={(r) => deleteRecord(r.id)}
        emptyMessage={t("table.noRecords", language)}
      />
    </div>
  );
}
