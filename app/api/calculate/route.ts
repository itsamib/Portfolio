import { NextResponse } from "next/server";
import { CalculationInput, AccountSummary, EnrichedRecord } from "@/lib/types";

const REQUIRED_FIELDS = [
  "date",
  "account_id",
  "portfolio_value",
  "cash_balance",
  "net_cash_flow",
];

function validatePayload(payload: unknown): string | null {
  if (!Array.isArray(payload)) {
    return "Request body must be a JSON array of records.";
  }
  if (payload.length === 0) return null;

  for (let i = 0; i < payload.length; i++) {
    const row = payload[i];
    if (typeof row !== "object" || row === null) {
      return `Record at index ${i} must be an object.`;
    }
    const missing = REQUIRED_FIELDS.filter((f) => !(f in (row as Record<string, unknown>)));
    if (missing.length > 0) {
      return `Record at index ${i} is missing field(s): ${missing.join(", ")}.`;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    if (payload === null) {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (payload.length === 0) {
      return NextResponse.json({ records: [], summary: [] });
    }

    const parsedRecords = (payload as CalculationInput[]).map((r) => ({
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
      const latestTotalEquity = lastItem.portfolio_value + lastItem.cash_balance;
      const roi = totalNetFlow !== 0 ? cumulativeProfit / totalNetFlow : null;

      summaryList.push({
        account_id: accountId,
        total_equity: latestTotalEquity,
        cumulative_profit: cumulativeProfit,
        total_net_flow: totalNetFlow,
        roi: roi,
      });
    }

    return NextResponse.json({
      records: enrichedRecords,
      summary: summaryList,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Calculation failed: ${message}` },
      { status: 500 }
    );
  }
}
