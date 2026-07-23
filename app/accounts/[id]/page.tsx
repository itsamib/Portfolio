"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Wallet, TrendingUp, Percent, ArrowLeftRight } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import BackButton from "@/components/BackButton";
import { calculatePortfolioLocal } from "@/lib/api";
import { CalculationResponse } from "@/lib/types";
import { t, formatCurrency, formatPercent } from "@/lib/i18n";
import MetricCard from "@/components/MetricCard";
import EquityLineChart from "@/components/charts/EquityLineChart";
import DailyProfitBarChart from "@/components/charts/DailyProfitBarChart";
import CumulativeProfitAreaChart from "@/components/charts/CumulativeProfitAreaChart";
import ProfitTimePeriods from "@/components/ProfitTimePeriods";
import CashInterestCard from "@/components/CashInterestCard";

export default function AccountDashboardPage() {
  const params = useParams<{ id: string }>();
  const accountId = params.id;
  const { accounts, records, loaded, currencyUnit } = useData();
  const { language } = useLanguage();

  const isRtl = language === "fa";

  const account = accounts.find((a) => a.id === accountId);
  const accountRecords = useMemo(
    () => records.filter((r) => r.account_id === accountId),
    [records, accountId]
  );

  const result = useMemo(() => {
    if (!loaded) return null;
    return calculatePortfolioLocal(
      accountRecords.map(({ date, account_id, portfolio_value, cash_balance, net_cash_flow }) => ({
        date,
        account_id,
        portfolio_value,
        cash_balance,
        net_cash_flow,
      }))
    );
  }, [loaded, accountRecords]);

  const summary = result?.summary.find((s) => s.account_id === accountId) ?? null;

  if (!account) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton label={t("account.backToAccounts", language)} />
        <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
          {t("account.notFound", language)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{account.name}</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {accountRecords.length} {t("account.logged", language)}
          </p>
        </div>
        <div>
          <BackButton label={t("account.backToAccounts", language)} />
        </div>
      </div>

      {accountRecords.length === 0 && (
        <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
          {t("account.noRecords", language)}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t("metric.latestEquity", language)}
          value={formatCurrency(summary?.total_equity ?? 0, language, currencyUnit)}
          icon={<Wallet className="w-4 h-4" />}
        />
        <MetricCard
          title={t("metric.cumulativeProfit", language)}
          value={formatCurrency(summary?.cumulative_profit ?? 0, language, currencyUnit)}
          tone={(summary?.cumulative_profit ?? 0) >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          title={t("metric.totalNetFlow", language)}
          value={formatCurrency(summary?.total_net_flow ?? 0, language, currencyUnit)}
          icon={<ArrowLeftRight className="w-4 h-4" />}
        />
        <MetricCard
          title={t("metric.roi", language)}
          value={formatPercent(summary?.roi ?? null, language)}
          tone={
            summary?.roi == null ? "neutral" : summary.roi >= 0 ? "positive" : "negative"
          }
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {/* Cash Deposit Interest Yield Card for this Account */}
      <CashInterestCard accountId={accountId} />

      {/* Period-based profit breakdown for this account */}
      {result && result.records.length > 0 && (
        <ProfitTimePeriods records={result.records} accountId={accountId} />
      )}

      {result && result.records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EquityLineChart records={result.records} title={t("chart.equity", language)} />
          <DailyProfitBarChart records={result.records} title={t("chart.dailyProfit", language)} />
          <div className="lg:col-span-2">
            <CumulativeProfitAreaChart records={result.records} title={t("chart.cumulativeProfit", language)} />
          </div>
        </div>
      )}
    </div>
  );
}
