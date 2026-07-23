"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EnrichedRecord } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency, t } from "@/lib/i18n";
import { toPersianDate } from "@/lib/persianDate";

interface Props {
  records: EnrichedRecord[];
  title?: string;
}

export default function CumulativeProfitAreaChart({
  records,
  title,
}: Props) {
  const { language } = useLanguage();
  const chartTitle = title || t("chart.cumulativeProfit", language);

  const data = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date,
      displayDate: language === "fa" ? toPersianDate(r.date) : r.date,
      cumulative_profit: r.cumulative_profit,
    }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-4">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cumulativeProfitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
          <XAxis dataKey="displayDate" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "0.75rem",
              color: "#f8fafc",
            }}
            formatter={(value: any) => [
              formatCurrency(Number(value), language),
              t("metric.cumulativeProfit", language),
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulative_profit"
            name={t("metric.cumulativeProfit", language)}
            stroke="#10b981"
            fill="url(#cumulativeProfitGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
