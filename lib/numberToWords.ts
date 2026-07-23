import { CurrencyUnit } from "./types";

const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const teens = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const tens = ["", "ده", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const scales = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function convertThreeDigits(num: number): string {
  if (num === 0) return "";
  const h = Math.floor(num / 100);
  const remainder = num % 100;
  const t = Math.floor(remainder / 10);
  const o = remainder % 10;

  const parts: string[] = [];

  if (h > 0) parts.push(hundreds[h]);

  if (remainder >= 10 && remainder < 20) {
    parts.push(teens[remainder - 10]);
  } else {
    if (t > 0) parts.push(tens[t]);
    if (o > 0) parts.push(ones[o]);
  }

  return parts.join(" و ");
}

function convertIntegerToPersianWords(num: number): string {
  if (num === 0) return "";

  const groups: number[] = [];
  let temp = Math.abs(num);
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const gWords = convertThreeDigits(g);
      const scale = scales[i];
      if (scale) {
        parts.push(`${gWords} ${scale}`);
      } else {
        parts.push(gWords);
      }
    }
  }

  return parts.join(" و ");
}

/**
 * Converts a numeric value into Persian words equivalent in Toman (or USD).
 */
export function numberToWordsPersian(val: number | string, unit: CurrencyUnit = "toman"): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val;
  if (num === null || num === undefined || Number.isNaN(num) || !Number.isFinite(num)) return "";

  const isNeg = num < 0;
  const absVal = Math.abs(num);

  if (absVal === 0) return "";

  // Convert to Toman equivalent for words description
  let tomanVal = absVal;
  if (unit === "rial") {
    tomanVal = absVal / 10; // 10 Rial = 1 Toman
  } else if (unit === "million_toman") {
    tomanVal = absVal * 1_000_000;
  }

  if (unit === "usd") {
    const intPart = Math.floor(absVal);
    const fracPart = Math.round((absVal - intPart) * 100);
    const words = convertIntegerToPersianWords(intPart);
    let str = words ? `${words} دلار` : "";
    if (fracPart > 0) {
      str += `${str ? " و " : ""}${convertIntegerToPersianWords(fracPart)} سنت`;
    }
    return isNeg ? `منفی ${str}` : str;
  }

  const intPart = Math.floor(tomanVal);
  const fracPart = Math.round((tomanVal - intPart) * 100);

  if (intPart === 0 && fracPart === 0) return "";

  const words = convertIntegerToPersianWords(intPart);
  let result = words ? `${words} تومان` : "";

  if (fracPart > 0) {
    const fracWords = convertIntegerToPersianWords(fracPart);
    if (result) {
      result += ` و ${fracWords} صدم تومان`;
    } else {
      result = `${fracWords} صدم تومان`;
    }
  }

  return isNeg ? `منفی ${result}` : result;
}

/**
 * Format a raw string or number with commas as thousands separators (e.g. 1000000 -> 1,000,000).
 */
export function formatThousandSeparated(val: string | number): string {
  if (val === "" || val === null || val === undefined) return "";
  const str = String(val).replace(/,/g, "");
  if (str === "-") return "-";
  const num = Number(str);
  if (Number.isNaN(num)) return String(val);

  const parts = str.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * Strip commas to get clean numeric string for state
 */
export function parseRawNumber(val: string): string {
  return val.replace(/,/g, "");
}
