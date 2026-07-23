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

interface Props {
  records: EnrichedRecord[];
  title?: string;
}

export default function CumulativeProfitAreaChart({
  records,
  title = "Cumulative Profit",
}: Props) {
  const data = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, cumulative_profit: r.cumulative_profit }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cumulativeProfitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="cumulative_profit"
            name="Cumulative Profit"
            stroke="#34d399"
            fill="url(#cumulativeProfitGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
