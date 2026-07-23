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

const COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#38bdf8", "#a78bfa"];

interface Props {
  records: EnrichedRecord[];
  title?: string;
  nameMap?: Record<string, string>;
}

export default function EquityLineChart({
  records,
  title = "Equity Over Time",
  nameMap = {},
}: Props) {
  const accountIds = Array.from(new Set(records.map((r) => r.account_id)));
  const dateMap = new Map<string, Record<string, any>>();

  for (const r of records) {
    if (!dateMap.has(r.date)) {
      dateMap.set(r.date, { date: r.date });
    }
    dateMap.get(r.date)![r.account_id] = r.total_equity;
  }

  const data = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0b0f1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              color: "#f3f4f6",
            }}
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
