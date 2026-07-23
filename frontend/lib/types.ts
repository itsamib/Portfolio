export interface PortfolioRecord {
  date: string;
  account_id: string;
  portfolio_value: number;
  cash_balance: number;
  net_cash_flow: number;
}

export interface EnrichedRecord extends PortfolioRecord {
  Total_Equity: number;
  Daily_Profit: number;
  Cumulative_Profit: number;
  Total_Net_Cash_Flow: number;
}

export interface SummaryRecord {
  Account_ID: string;
  Total_Equity: number;
  Cumulative_Profit: number;
  Total_Net_Cash_Flow: number;
  ROI: number;
  Date: string;
}

export interface CalculateResponse {
  enriched_data: EnrichedRecord[];
  summary: SummaryRecord[];
  total_equity: number;
  total_profit: number;
  overall_roi: number | null;
}

export interface Account {
  name: string;
}
