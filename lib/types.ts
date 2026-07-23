export interface Account {
  id: string;
  name: string;
  created_at: string;
}

export interface PortfolioRecord {
  id: string;
  date: string; // ISO date string, e.g. 2026-07-01
  account_id: string;
  portfolio_value: number;
  cash_balance: number;
  net_cash_flow: number;
}

// Fields the Python /api/calculate endpoint accepts (no local-only `id`)
export interface CalculationInput {
  date: string;
  account_id: string;
  portfolio_value: number;
  cash_balance: number;
  net_cash_flow: number;
}

// A record enriched by the Python calculation service
export interface EnrichedRecord extends CalculationInput {
  total_equity: number;
  daily_profit: number;
  cumulative_profit: number;
}

export interface AccountSummary {
  account_id: string;
  total_equity: number;
  cumulative_profit: number;
  total_net_flow: number;
  roi: number | null;
}

export interface CalculationResponse {
  records: EnrichedRecord[];
  summary: AccountSummary[];
}
