import pandas as pd
import streamlit as st


def compute_metrics(df):
    """
    Compute Total_Equity, Daily_Profit, Cumulative_Profit, and ROI metrics.
    
    Formula:
        Daily_Profit = (Today's Total_Equity - Yesterday's Total_Equity) - Today's Net_Cash_Flow
    
    Args:
        df: DataFrame with required columns:
            - Date
            - Account_ID
            - Portfolio_Value
            - Cash_Balance
            - Net_Cash_Flow
            
    Returns:
        Tuple of (enriched_df, summary_df) where:
            - enriched_df: Original DataFrame with computed columns
            - summary_df: Summary of latest cumulative profit and ROI per account
    """
    # Ensure date is datetime
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    if df["Date"].isna().any():
        st.warning("Some dates could not be parsed and will be dropped.")
        df = df.dropna(subset=["Date"])

    # Sort by account and date
    df = df.sort_values(["Account_ID", "Date"]).reset_index(drop=True)

    # Total Equity = Portfolio Value + Cash Balance
    df["Total_Equity"] = df["Portfolio_Value"] + df["Cash_Balance"]

    # Daily Profit (using yesterday's equity and today's net cash flow)
    # For each account, compute previous day's Total_Equity
    df["Prev_Equity"] = df.groupby("Account_ID")["Total_Equity"].shift(1)
    df["Daily_Profit"] = (df["Total_Equity"] - df["Prev_Equity"]) - df["Net_Cash_Flow"]
    
    # First day of each account will have NaN; fill with 0 (no profit from prior)
    df["Daily_Profit"] = df["Daily_Profit"].fillna(0)

    # Cumulative profit per account
    df["Cumulative_Profit"] = df.groupby("Account_ID")["Daily_Profit"].cumsum()

    # Total net cash flow per account (sum of all net cash flows)
    net_cash_flows = df.groupby("Account_ID")["Net_Cash_Flow"].sum().reset_index()
    net_cash_flows.columns = ["Account_ID", "Total_Net_Cash_Flow"]

    # Merge to get per-account total net cash flow
    df = df.merge(net_cash_flows, on="Account_ID", how="left")

    # Latest cumulative profit for each account (for summary)
    latest_idx = df.groupby("Account_ID")["Date"].idxmax()
    latest_df = df.loc[latest_idx, ["Account_ID", "Cumulative_Profit", "Total_Net_Cash_Flow"]].copy()
    
    # Calculate ROI: Cumulative_Profit / Total_Net_Cash_Flow
    latest_df["ROI"] = latest_df.apply(
        lambda row: row["Cumulative_Profit"] / row["Total_Net_Cash_Flow"]
        if row["Total_Net_Cash_Flow"] != 0 else None,
        axis=1,
    )
    
    return df, latest_df
