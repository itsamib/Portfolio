/**
 * Exact Jalali (Persian) <-> Gregorian Date Conversion Utilities
 * Based on the standard tested Jalaali algorithm
 */

export interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/**
 * Convert Gregorian date to Jalali
 */
export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/**
 * Convert Jalali date to Gregorian Date object
 */
export function toGregorian(jy: number, jm: number, jd: number): Date {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return new Date(gy, gm - 1, gd);
}

/**
 * Format Date or ISO string to Persian date string "1405/05/01"
 */
export const toPersianDate = (date: Date | string): string => {
  let d: Date;
  if (typeof date === "string") {
    const cleanStr = date.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const [y, m, day] = cleanStr.split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return "";

  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  const { jy, jm, jd } = toJalaali(gy, gm, gd);

  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
};

/**
 * Convert Persian date string "1405/05/01" to Gregorian Date object
 */
export const toGregorianDate = (persianDateStr: string): Date => {
  const parts = persianDateStr.replace(/-/g, "/").split("/").map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return new Date();
  const [jy, jm, jd] = parts;
  return toGregorian(jy, jm, jd);
};

/**
 * Convert Persian date string "1405/05/01" to ISO Date string "2026-07-23"
 */
export const jalaliToIso = (persianDateStr: string): string => {
  const gDate = toGregorianDate(persianDateStr);
  if (isNaN(gDate.getTime())) return new Date().toISOString().slice(0, 10);
  const gy = gDate.getFullYear();
  const gm = String(gDate.getMonth() + 1).padStart(2, "0");
  const gd = String(gDate.getDate()).padStart(2, "0");
  return `${gy}-${gm}-${gd}`;
};

/**
 * Get Persian month name
 */
export const getPersianMonthName = (monthNumber: number): string => {
  const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  return months[monthNumber - 1] || "";
};

/**
 * Format Persian date with month name e.g. "1 مرداد 1405"
 */
export const formatPersianDate = (
  date: Date | string,
  format: "full" | "short" = "full"
): string => {
  const persianDate = toPersianDate(date);
  if (!persianDate) return "";
  const [year, month, day] = persianDate.split("/");

  if (format === "short") {
    return `${Number(day)} ${getPersianMonthName(Number(month))}`;
  }

  const monthName = getPersianMonthName(Number(month));
  return `${Number(day)} ${monthName} ${year}`;
};

/**
 * Get week number in Persian calendar
 */
export const getPersianWeekNumber = (date: Date): number => {
  const persianDate = toPersianDate(date);
  if (!persianDate) return 1;
  const [, month, day] = persianDate.split("/").map(Number);
  const dayOfYear = month <= 6 ? (month - 1) * 31 + day : 186 + (month - 7) * 30 + day;
  return Math.ceil(dayOfYear / 7);
};

/**
 * Get Persian quarter
 */
export const getPersianQuarter = (date: Date): number => {
  const persianDate = toPersianDate(date);
  if (!persianDate) return 1;
  const [, month] = persianDate.split("/").map(Number);

  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
};
