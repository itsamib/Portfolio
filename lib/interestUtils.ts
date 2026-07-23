import { CashInterestItem, PortfolioRecord } from "./types";

export interface CashYieldMetrics {
  currentCashBalance: number;
  accruedProfit: number; // Daily accumulated profit so far in current cycle
  monthlyForecastProfit: number; // Forecasted profit for 1 month based on current cash
  nextMaturityDate: string; // ISO date string YYYY-MM-DD
  daysRemaining: number; // Days left until next maturity
  isDue: boolean; // whether today >= nextMaturityDate
}

/**
 * Calculates daily accrued interest, forecasted monthly profit, and next maturity date.
 */
export function calculateCashYieldMetrics(
  item: CashInterestItem,
  accountRecords: PortfolioRecord[],
  todayIso: string = new Date().toISOString().slice(0, 10)
): CashYieldMetrics {
  // Sort account records by date ascending
  const sorted = [...accountRecords].sort((a, b) => a.date.localeCompare(b.date));

  // Current cash balance (from latest record)
  const latestRecord = sorted[sorted.length - 1];
  const currentCashBalance = latestRecord ? latestRecord.cash_balance : 0;

  // Cycle start date
  const startDate = item.last_settlement_date || item.created_at.slice(0, 10) || todayIso;

  // Calculate next maturity date
  const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
  let targetYear = sYear;
  let targetMonth = sMonth;

  // If start date's day of month is >= item.maturity_day, move target to next month
  if (sDay >= item.maturity_day) {
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  }

  // Ensure valid day of target month (e.g. Feb 28/29, or 30-day months)
  const maxDaysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const safeMaturityDay = Math.min(item.maturity_day, maxDaysInTargetMonth);
  const nextMaturityDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(safeMaturityDay).padStart(2, "0")}`;

  // Days remaining until next maturity
  const tTime = new Date(todayIso).getTime();
  const mTime = new Date(nextMaturityDate).getTime();
  const diffDays = Math.ceil((mTime - tTime) / (1000 * 3600 * 24));
  const daysRemaining = Math.max(0, diffDays);
  const isDue = todayIso >= nextMaturityDate;

  // Compute daily accrued profit from startDate to today
  let accruedProfit = 0;
  const dailyRate =
    item.interest_period === "yearly"
      ? item.interest_rate / 365 / 100
      : item.interest_rate / 30 / 100;

  const startMs = new Date(startDate).getTime();
  const todayMs = new Date(todayIso).getTime();

  if (todayMs >= startMs) {
    const totalDays = Math.floor((todayMs - startMs) / (1000 * 3600 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const curDateMs = startMs + i * 24 * 3600 * 1000;
      const curIso = new Date(curDateMs).toISOString().slice(0, 10);

      // Find latest cash balance on or before curIso
      const activeRecord = [...sorted]
        .reverse()
        .find((r) => r.date <= curIso);

      const cashOnDay = activeRecord ? activeRecord.cash_balance : 0;
      accruedProfit += cashOnDay * dailyRate;
    }
  }

  // Forecasted monthly profit with current cash balance
  const monthlyRate =
    item.interest_period === "yearly"
      ? item.interest_rate / 12 / 100
      : item.interest_rate / 100;

  const monthlyForecastProfit = currentCashBalance * monthlyRate;

  return {
    currentCashBalance,
    accruedProfit: Math.max(0, Math.round(accruedProfit * 100) / 100),
    monthlyForecastProfit: Math.max(0, Math.round(monthlyForecastProfit * 100) / 100),
    nextMaturityDate,
    daysRemaining,
    isDue,
  };
}
