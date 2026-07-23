"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { EnrichedRecord } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency, t } from "@/lib/i18n";
import { toPersianDate } from "@/lib/persianDate";

const COLORS = ["#6366f1", "#10b981", "#ec4899", "#f59e0b", "#06b6d4", "#8b5cf6"];

interface Props {
  records: EnrichedRecord[];
  title?: string;
  nameMap?: Record<string, string>;
}

export default function EquityLineChart({
  records,
  title,
  nameMap = {},
}: Props) {
  const { language } = useLanguage();
  const chartTitle = title || t("chart.equity", language);

  const accountIds = Array.from(new Set(records.map((r) => r.account_id)));
  const dateMap = new Map<string, Record<string, any>>();

  for (const r of records) {
    if (!dateMap.has(r.date)) {
      const displayDate = language === "fa" ? toPersianDate(r.date) : r.date;
      dateMap.set(r.date, { date: r.date, displayDate });
    }
    dateMap.get(r.date)![r.account_id] = r.total_equity;
  }

  const data = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-4">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
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
            formatter={(value: any) => [formatCurrency(Number(value), language), ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
            formatter={(value: string) => nameMap[value] ?? value}
          />
          {accountIds.map((id, i) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={nameMap[id] ?? id}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
