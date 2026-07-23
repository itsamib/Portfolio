import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "neutral" | "positive" | "negative";
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  neutral: "text-gray-100",
  positive: "text-profit",
  negative: "text-loss",
};

export default function MetricCard({
  title,
  value,
  subtitle,
  tone = "neutral",
  icon,
}: MetricCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{title}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <span className={`text-xl sm:text-2xl font-semibold tabular-nums break-words ${toneClasses[tone]}`}>
        {value}
      </span>
      {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
    </div>
  );
}
