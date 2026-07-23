"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Wallet, TrendingUp, Percent, ArrowLeftRight } from "lucide-react";
import { useData } from "@/context/DataContext";
import { calculatePortfolio } from "@/lib/api";
import { CalculationResponse } from "@/lib/types";
import MetricCard from "@/components/MetricCard";
import EquityLineChart from "@/components/charts/EquityLineChart";
import DailyProfitBarChart from "@/components/charts/DailyProfitBarChart";
import CumulativeProfitAreaChart from "@/components/charts/CumulativeProfitAreaChart";

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

export default function AccountDashboardPage() {
  const params = useParams<{ id: string }>();
  const accountId = params.id;
  const { accounts, records, loaded } = useData();

  const account = accounts.find((a) => a.id === accountId);
  const accountRecords = useMemo(
    () => records.filter((r) => r.account_id === accountId),
    [records, accountId]
  );

  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) return;
    setLoading(true);
    setError(null);
    calculatePortfolio(
      accountRecords.map(({ date, account_id, portfolio_value, cash_balance, net_cash_flow }) => ({
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
  }, [loaded, accountRecords]);

  const summary = result?.summary.find((s) => s.account_id === accountId) ?? null;

  if (!account) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/accounts" className="text-sm text-accent flex items-center gap-1 w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to accounts
        </Link>
        <div className="glass-card p-8 text-center text-sm text-gray-500">
          Account not found. It may have been deleted.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/accounts" className="text-sm text-accent flex items-center gap-1 w-fit mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to accounts
        </Link>
        <h1 className="text-2xl font-semibold">{account.name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {accountRecords.length} record{accountRecords.length === 1 ? "" : "s"} logged.
        </p>
      </div>

      {error && (
        <div className="glass-card p-4 border-loss/40 text-loss text-sm">{error}</div>
      )}

      {!loading && accountRecords.length === 0 && (
        <div className="glass-card p-8 text-center text-sm text-gray-500">
          No records for this account yet. Add some from the Data Entry page.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Latest Equity"
          value={formatCurrency(summary?.total_equity ?? 0)}
          icon={<Wallet className="w-4 h-4" />}
        />
        <MetricCard
          title="Cumulative Profit"
          value={formatCurrency(summary?.cumulative_profit ?? 0)}
          tone={(summary?.cumulative_profit ?? 0) >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          title="Total Net Flow"
          value={formatCurrency(summary?.total_net_flow ?? 0)}
          icon={<ArrowLeftRight className="w-4 h-4" />}
        />
        <MetricCard
          title="ROI"
          value={formatPercent(summary?.roi ?? null)}
          tone={
            summary?.roi == null ? "neutral" : summary.roi >= 0 ? "positive" : "negative"
          }
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {result && result.records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EquityLineChart records={result.records} title="Equity" />
          <DailyProfitBarChart records={result.records} title="Daily Profit" />
          <div className="lg:col-span-2">
            <CumulativeProfitAreaChart records={result.records} title="Cumulative Profit" />
          </div>
        </div>
      )}
    </div>
  );
}
