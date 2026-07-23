import pandas as pd
from typing import Tuple


def compute_metrics(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Compute portfolio metrics including daily profit adjusted for cash flows.
    
    Formula:
        Daily_Profit = (Today's Total_Equity - Yesterday's Total_Equity) - Today's Net_Cash_Flow
        Total_Equity = Portfolio_Value + Cash_Balance
        ROI = Cumulative_Profit / Total_Net_Cash_Flow
    
    Args:
        df: DataFrame with required columns:
            - Date (datetime or string)
            - Account_ID (string)
            - Portfolio_Value (numeric)
            - Cash_Balance (numeric)
            - Net_Cash_Flow (numeric)
    
    Returns:
        Tuple of (enriched_df, summary_df) where:
            - enriched_df: Original DataFrame with computed columns (Total_Equity, Daily_Profit, etc.)
            - summary_df: One row per account with latest Cumulative_Profit, Total_Net_Cash_Flow, ROI
    """
    if df.empty:
        return df, pd.DataFrame()
    
    # Make a copy to avoid modifying original
    df = df.copy()
    
    # Ensure date is datetime
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    if df["Date"].isna().any():
        df = df.dropna(subset=["Date"])
    
    # Sort by account and date
    df = df.sort_values(["Account_ID", "Date"]).reset_index(drop=True)
    
    # Compute Total Equity
    df["Total_Equity"] = df["Portfolio_Value"] + df["Cash_Balance"]
    
    # Compute previous day's equity per account
    df["Prev_Equity"] = df.groupby("Account_ID")["Total_Equity"].shift(1)
    
    # Compute Daily Profit: (Today's Equity - Prev Equity) - Today's Net Cash Flow
    df["Daily_Profit"] = (df["Total_Equity"] - df["Prev_Equity"]) - df["Net_Cash_Flow"]
    
    # First day of each account has NaN; fill with 0
    df["Daily_Profit"] = df["Daily_Profit"].fillna(0)
    
    # Compute Cumulative Profit per account
    df["Cumulative_Profit"] = df.groupby("Account_ID")["Daily_Profit"].cumsum()
    
    # Compute total net cash flow per account
    total_net_flows = df.groupby("Account_ID")["Net_Cash_Flow"].sum().reset_index()
    total_net_flows.columns = ["Account_ID", "Total_Net_Cash_Flow"]
    
    # Merge to add total net cash flow to each row
    df = df.merge(total_net_flows, on="Account_ID", how="left")
    
    # Create summary DataFrame (latest row per account)
    latest_idx = df.groupby("Account_ID")["Date"].idxmax()
    summary_df = df.loc[latest_idx, [
        "Account_ID", "Total_Equity", "Cumulative_Profit", "Total_Net_Cash_Flow", "Date"
    ]].copy().reset_index(drop=True)
    
    # Compute ROI
    summary_df["ROI"] = summary_df.apply(
        lambda row: row["Cumulative_Profit"] / row["Total_Net_Cash_Flow"]
        if row["Total_Net_Cash_Flow"] != 0 else 0,
        axis=1,
    )
    
    return df, summary_df
