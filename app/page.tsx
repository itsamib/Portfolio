"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Percent } from "lucide-react";
import { useData } from "@/context/DataContext";
import { calculatePortfolio } from "@/lib/api";
import { CalculationResponse } from "@/lib/types";
import MetricCard from "@/components/MetricCard";
import DataTable, { DataTableColumn } from "@/components/DataTable";
import DailyProfitBarChart from "@/components/charts/DailyProfitBarChart";
import EquityLineChart from "@/components/charts/EquityLineChart";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export default function DashboardPage() {
  const { accounts, records, loaded } = useData();
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
      header: "Account",
      render: (row) => nameMap[row.account_id] ?? row.account_id,
    },
    {
      key: "equity",
      header: "Latest Equity",
      align: "right",
      render: (row) => formatCurrency(row.total_equity),
    },
    {
      key: "profit",
      header: "Cumulative Profit",
      align: "right",
      render: (row) => (
        <span className={row.cumulative_profit >= 0 ? "text-profit" : "text-loss"}>
          {formatCurrency(row.cumulative_profit)}
        </span>
      ),
    },
    {
      key: "net_flow",
      header: "Total Net Flow",
      align: "right",
      render: (row) => formatCurrency(row.total_net_flow),
    },
    {
      key: "roi",
      header: "ROI",
      align: "right",
      render: (row) => (
        <span
          className={
            row.roi === null
              ? "text-gray-500"
              : row.roi >= 0
              ? "text-profit"
              : "text-loss"
          }
        >
          {formatPercent(row.roi)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview across all {accounts.length} account
          {accounts.length === 1 ? "" : "s"}.
        </p>
      </div>

      {error && (
        <div className="glass-card p-4 border-loss/40 text-loss text-sm">
          {error}
        </div>
      )}

      {!loading && loaded && records.length === 0 && (
        <div className="glass-card p-8 text-center text-sm text-gray-500">
          No data yet. Add accounts and records from the Data Entry page to see
          your dashboard come alive.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Equity"
          value={formatCurrency(totals.equity)}
          icon={<Wallet className="w-4 h-4" />}
        />
        <MetricCard
          title="Total Net Profit"
          value={formatCurrency(totals.profit)}
          tone={totals.profit >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          title="Overall ROI"
          value={formatPercent(totals.roi)}
          tone={
            totals.roi === null ? "neutral" : totals.roi >= 0 ? "positive" : "negative"
          }
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {result && result.summary.length > 0 && (
        <DataTable
          columns={columns}
          rows={result.summary}
          getRowId={(row) => row.account_id}
        />
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
