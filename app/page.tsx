"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Percent } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { calculatePortfolio } from "@/lib/api";
import { CalculationResponse } from "@/lib/types";
import { t, formatCurrency, formatPercent } from "@/lib/i18n";
import MetricCard from "@/components/MetricCard";
import DataTable, { DataTableColumn } from "@/components/DataTable";
import DailyProfitBarChart from "@/components/charts/DailyProfitBarChart";
import EquityLineChart from "@/components/charts/EquityLineChart";
import ProfitTimePeriods from "@/components/ProfitTimePeriods";

export default function DashboardPage() {
  const { accounts, records, loaded, currencyUnit } = useData();
  const { language } = useLanguage();
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameMap = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  useEffect(() => {
    if (!loaded) return;
    setLoading(true);
    setError(null);
    calculatePortfolio(
      records.map(({ date, account_id, portfolio_value, cash_balance, net_cash_flow }) => ({
        date,
        account_id,
        portfolio_value,
        cash_balance,
        net_cash_flow,
      }))
    )
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loaded, records]);

  const totals = useMemo(() => {
    if (!result) return { equity: 0, profit: 0, roi: null as number | null };
    const equity = result.summary.reduce((sum, s) => sum + s.total_equity, 0);
    const profit = result.summary.reduce((sum, s) => sum + s.cumulative_profit, 0);
    const netFlow = result.summary.reduce((sum, s) => sum + s.total_net_flow, 0);
    const roi = netFlow !== 0 ? profit / netFlow : null;
    return { equity, profit, roi };
  }, [result]);

  const columns: DataTableColumn<CalculationResponse["summary"][number]>[] = [
    {
      key: "account",
      header: t("table.account", language),
      render: (row) => nameMap[row.account_id] ?? row.account_id,
    },
    {
      key: "equity",
      header: t("table.equity", language),
      align: "right",
      render: (row) => formatCurrency(row.total_equity, language, currencyUnit),
    },
    {
      key: "profit",
      header: t("table.profit", language),
      align: "right",
      render: (row) => (
        <span className={row.cumulative_profit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-600 dark:text-rose-400 font-medium"}>
          {formatCurrency(row.cumulative_profit, language, currencyUnit)}
        </span>
      ),
    },
    {
      key: "net_flow",
      header: t("table.netCashFlow", language),
      align: "right",
      render: (row) => formatCurrency(row.total_net_flow, language, currencyUnit),
    },
    {
      key: "roi",
      header: t("table.roi", language),
      align: "right",
      render: (row) => (
        <span
          className={
            row.roi === null
              ? "text-slate-400 dark:text-gray-500"
              : row.roi >= 0
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-rose-600 dark:text-rose-400 font-medium"
          }
        >
          {formatPercent(row.roi, language)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("dashboard.title", language)}
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          {t("dashboard.subtitle", language)}
        </p>
      </div>

      {error && (
        <div className="glass-card p-4 border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {!loading && loaded && records.length === 0 && (
        <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
          {t("dashboard.noData", language)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title={t("metric.totalEquity", language)}
          value={formatCurrency(totals.equity, language, currencyUnit)}
          icon={<Wallet className="w-5 h-5" />}
        />
        <MetricCard
          title={t("metric.cumulativeProfit", language)}
          value={formatCurrency(totals.profit, language, currencyUnit)}
          tone={totals.profit >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title={t("metric.roi", language)}
          value={formatPercent(totals.roi, language)}
          tone={
            totals.roi === null ? "neutral" : totals.roi >= 0 ? "positive" : "negative"
          }
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Time-based Profit Analysis (Daily, Weekly, Monthly, 3M, 6M, Yearly) */}
      {result && result.records.length > 0 && (
        <ProfitTimePeriods records={result.records} />
      )}

      {result && result.summary.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("dashboard.accountSummary", language)}
          </h2>
          <DataTable
            columns={columns}
            rows={result.summary}
            getRowId={(row) => row.account_id}
          />
        </div>
      )}

      {result && result.records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DailyProfitBarChart records={result.records} nameMap={nameMap} />
          <EquityLineChart records={result.records} nameMap={nameMap} />
        </div>
      )}
    </div>
  );
}
