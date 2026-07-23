"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { numberToWordsPersian, formatThousandSeparated, parseRawNumber } from "@/lib/numberToWords";

interface Props {
  label?: string;
  value: string | number;
  onChange: (rawNumericString: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  allowNegative?: boolean;
  disabled?: boolean;
}

export const FormattedNumberInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder = "0",
  required = false,
  className = "glass-input",
  allowNegative = true,
  disabled = false,
}) => {
  const { currencyUnit } = useData();
  const { language } = useLanguage();
  const isRtl = language === "fa";

  // Display value state (formatted with commas)
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      setDisplayValue("");
    } else {
      setDisplayValue(formatThousandSeparated(String(value)));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    // Convert Persian / Arabic digits to English digits
    inputVal = inputVal.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
    inputVal = inputVal.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

    // Strip characters other than digits, dot, and minus
    if (allowNegative) {
      inputVal = inputVal.replace(/[^0-9.-]/g, "");
      // Ensure only single minus sign at start
      if (inputVal.indexOf("-") > 0) {
        inputVal = inputVal.replace(/-/g, "");
      }
    } else {
      inputVal = inputVal.replace(/[^0-9.]/g, "");
    }

    const raw = parseRawNumber(inputVal);
    setDisplayValue(formatThousandSeparated(raw));
    onChange(raw);
  };

  const numericValue = parseFloat(parseRawNumber(String(value || "")));
  const wordsInPersian = !isNaN(numericValue) && numericValue !== 0
    ? numberToWordsPersian(numericValue, currencyUnit)
    : "";

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
          {label}
        </label>
      )}

      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${className} tabular-nums`}
        dir="ltr"
      />

      {/* Persian Words Helper Underneath */}
      {wordsInPersian && (
        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 mt-0.5 animate-in fade-in duration-200">
          <span className="text-slate-500 dark:text-gray-400 font-normal">
            {isRtl ? "معادل به حروف: " : "In words: "}
          </span>
          <span>{wordsInPersian}</span>
        </div>
      )}
    </div>
  );
};

export default FormattedNumberInput;
