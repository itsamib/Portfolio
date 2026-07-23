"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, MinusCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { numberToWordsPersian } from "@/lib/numberToWords";
import FormattedNumberInput from "./FormattedNumberInput";

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

type FlowType = "deposit" | "withdrawal" | "none";

export const CashFlowInput: React.FC<Props> = ({
  value,
  onChange,
  label = "جریان نقدینگی (واریز / برداشت)",
}) => {
  const { currencyUnit } = useData();
  const { language } = useLanguage();
  const isRtl = language === "fa";

  const numericValue = parseFloat(value || "0");

  // Determine active flow type
  const [flowType, setFlowType] = useState<FlowType>(() => {
    if (numericValue < 0) return "withdrawal";
    if (numericValue > 0) return "deposit";
    return "deposit"; // Default to deposit if 0 or empty
  });

  // Magnitude string (always positive)
  const [magnitude, setMagnitude] = useState<string>(() => {
    if (isNaN(numericValue) || numericValue === 0) return "0";
    return String(Math.abs(numericValue));
  });

  // Sync state if external value changes (e.g. during form reset or editing record)
  useEffect(() => {
    const num = parseFloat(value || "0");
    if (isNaN(num) || num === 0) {
      if (value === "0" || value === "") {
        setMagnitude("0");
      }
    } else if (num < 0) {
      setFlowType("withdrawal");
      setMagnitude(String(Math.abs(num)));
    } else {
      setFlowType("deposit");
      setMagnitude(String(num));
    }
  }, [value]);

  const handleFlowTypeChange = (type: FlowType) => {
    setFlowType(type);
    if (type === "none") {
      setMagnitude("0");
      onChange("0");
      return;
    }

    const absVal = Math.abs(parseFloat(magnitude || "0"));
    if (type === "withdrawal") {
      onChange(absVal > 0 ? `-${absVal}` : "0");
    } else {
      onChange(absVal > 0 ? `${absVal}` : "0");
    }
  };

  const handleMagnitudeChange = (rawPositiveStr: string) => {
    setMagnitude(rawPositiveStr);
    const absVal = Math.abs(parseFloat(rawPositiveStr || "0"));

    if (isNaN(absVal) || absVal === 0) {
      onChange("0");
      return;
    }

    if (flowType === "withdrawal") {
      onChange(`-${absVal}`);
    } else {
      onChange(`${absVal}`);
    }
  };

  const currentAbsNum = Math.abs(parseFloat(magnitude || "0"));
  const words = currentAbsNum > 0 ? numberToWordsPersian(currentAbsNum, currencyUnit) : "";

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-gray-300">
          {label}
        </label>
        {flowType === "withdrawal" && currentAbsNum > 0 && (
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
            {isRtl ? "خروج نقدینگی (برداشت)" : "Cash Withdrawal"}
          </span>
        )}
        {flowType === "deposit" && currentAbsNum > 0 && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {isRtl ? "ورود نقدینگی (واریز)" : "Cash Deposit"}
          </span>
        )}
      </div>

      {/* Modern Type Selector Buttons */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
        <button
          type="button"
          onClick={() => handleFlowTypeChange("deposit")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
            flowType === "deposit"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
              : "text-slate-600 dark:text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>{isRtl ? "واریز (+)" : "Deposit (+)"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleFlowTypeChange("withdrawal")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
            flowType === "withdrawal"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.02]"
              : "text-slate-600 dark:text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{isRtl ? "برداشت (-)" : "Withdrawal (-)"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleFlowTypeChange("none")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
            flowType === "none" || (currentAbsNum === 0 && flowType !== "withdrawal")
              ? "bg-slate-700 text-white shadow-md shadow-slate-700/20 dark:bg-gray-700 scale-[1.02]"
              : "text-slate-600 dark:text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
          }`}
        >
          <MinusCircle className="w-4 h-4" />
          <span>{isRtl ? "بدون تغییر (۰)" : "Zero (0)"}</span>
        </button>
      </div>

      {/* Amount Input */}
      {flowType !== "none" && (
        <div className="relative">
          <FormattedNumberInput
            value={magnitude}
            onChange={handleMagnitudeChange}
            placeholder="0"
            allowNegative={false}
          />
        </div>
      )}

      {/* Cash Flow Summary & Persian Words Helper */}
      {currentAbsNum > 0 && flowType !== "none" && words && (
        <div
          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 animate-in fade-in duration-200 ${
            flowType === "withdrawal"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          <span className="shrink-0">
            {flowType === "withdrawal"
              ? isRtl
                ? "مبلغ برداشت به حروف: "
                : "Withdrawal in words: "
              : isRtl
              ? "مبلغ واریز به حروف: "
              : "Deposit in words: "}
          </span>
          <span className="font-semibold">{words}</span>
        </div>
      )}
    </div>
  );
};

export default CashFlowInput;
