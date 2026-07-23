import { CalculationInput, CalculationResponse, EnrichedRecord, AccountSummary } from "./types";

/**
 * Fast synchronous in-memory portfolio calculation.
 * Eliminates network latency on page navigation.
 */
export function calculatePortfolioLocal(
  records: CalculationInput[]
): CalculationResponse {
  if (!records || records.length === 0) {
    return { records: [], summary: [] };
  }

  const parsedRecords = records.map((r) => ({
    date: String(r.date || "").slice(0, 10),
    account_id: String(r.account_id || ""),
    portfolio_value: Number.isNaN(Number(r.portfolio_value))
      ? 0
      : Number(r.portfolio_value),
    cash_balance: Number.isNaN(Number(r.cash_balance))
      ? 0
      : Number(r.cash_balance),
    net_cash_flow: Number.isNaN(Number(r.net_cash_flow))
      ? 0
      : Number(r.net_cash_flow),
  }));

  const recordsByAccount: Record<string, typeof parsedRecords> = {};
  for (const rec of parsedRecords) {
    if (!recordsByAccount[rec.account_id]) {
      recordsByAccount[rec.account_id] = [];
    }
    recordsByAccount[rec.account_id].push(rec);
  }

  const enrichedRecords: EnrichedRecord[] = [];
  const summaryList: AccountSummary[] = [];

  const accountIds = Object.keys(recordsByAccount).sort();

  for (const accountId of accountIds) {
    const group = recordsByAccount[accountId];
    group.sort((a, b) => a.date.localeCompare(b.date));

    let cumulativeProfit = 0;
    let totalNetFlow = 0;

    for (let i = 0; i < group.length; i++) {
      const item = group[i];
      const totalEquity = item.portfolio_value + item.cash_balance;

      let dailyProfit = 0;
      if (i > 0) {
        const prevItem = group[i - 1];
        const prevTotalEquity = prevItem.portfolio_value + prevItem.cash_balance;
        dailyProfit = totalEquity - prevTotalEquity - item.net_cash_flow;
      }

      cumulativeProfit += dailyProfit;
      totalNetFlow += item.net_cash_flow;

      enrichedRecords.push({
        date: item.date,
        account_id: item.account_id,
        portfolio_value: item.portfolio_value,
        cash_balance: item.cash_balance,
        net_cash_flow: item.net_cash_flow,
        total_equity: totalEquity,
        daily_profit: dailyProfit,
        cumulative_profit: cumulativeProfit,
      });
    }

    const lastItem = group[group.length - 1];
    const latestTotalEquity = lastItem ? lastItem.portfolio_value + lastItem.cash_balance : 0;
    const roi = totalNetFlow !== 0 ? cumulativeProfit / totalNetFlow : null;

    summaryList.push({
      account_id: accountId,
      total_equity: latestTotalEquity,
      cumulative_profit: cumulativeProfit,
      total_net_flow: totalNetFlow,
      roi: roi,
    });
  }

  return {
    records: enrichedRecords,
    summary: summaryList,
  };
}

/**
 * Legacy API fetch helper - now uses fast synchronous calculation
 * to prevent page transition slowness.
 */
export async function calculatePortfolio(
  records: CalculationInput[]
): Promise<CalculationResponse> {
  return calculatePortfolioLocal(records);
}
