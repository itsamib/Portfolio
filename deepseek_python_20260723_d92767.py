import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from io import StringIO

# ------------------------------
# Page configuration
# ------------------------------
st.set_page_config(
    page_title="Portfolio Performance Tracker",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ------------------------------
# Helper: load and validate data
# ------------------------------
@st.cache_data
def load_data(uploaded_file):
    """Read CSV or Excel file and return a DataFrame."""
    if uploaded_file is None:
        return None
    filename = uploaded_file.name.lower()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("Unsupported file format. Please upload a CSV or Excel file.")
            return None
    except Exception as e:
        st.error(f"Error reading file: {e}")
        return None
    return df

def validate_columns(df):
    """Check that required columns exist."""
    required = {"Date", "Account_ID", "Portfolio_Value", "Cash_Balance", "Net_Cash_Flow"}
    missing = required - set(df.columns)
    if missing:
        st.error(f"Missing columns: {missing}")
        return False
    return True

# ------------------------------
# Core calculation engine
# ------------------------------
def compute_metrics(df):
    """
    Compute Total_Equity, Daily_Profit, Cumulative_Profit, and ROI.
    Returns the enriched DataFrame and a summary per account.
    """
    # Ensure date is datetime
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    if df["Date"].isna().any():
        st.warning("Some dates could not be parsed and will be dropped.")
        df = df.dropna(subset=["Date"])

    # Sort by account and date
    df = df.sort_values(["Account_ID", "Date"]).reset_index(drop=True)

    # Total Equity
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

    # Merge to get per‑account ROI
    df = df.merge(net_cash_flows, on="Account_ID", how="left")

    # Latest cumulative profit for each account (for summary)
    latest_idx = df.groupby("Account_ID")["Date"].idxmax()
    latest_df = df.loc[latest_idx, ["Account_ID", "Cumulative_Profit", "Total_Net_Cash_Flow"]].copy()
    latest_df["ROI"] = latest_df.apply(
        lambda row: row["Cumulative_Profit"] / row["Total_Net_Cash_Flow"]
        if row["Total_Net_Cash_Flow"] != 0 else None,
        axis=1,
    )
    return df, latest_df

# ------------------------------
# Main Streamlit app
# ------------------------------
def main():
    st.title("📊 Portfolio Performance Tracker")
    st.markdown("""
    Upload a CSV or Excel file with daily snapshots of each account.  
    **Required columns:** `Date`, `Account_ID`, `Portfolio_Value`, `Cash_Balance`, `Net_Cash_Flow`.  
    The app calculates *daily profit* adjusted for cash flows using:  
    **Daily Profit = (Today's Equity − Yesterday's Equity) − Today's Net Cash Flow**
    """)

    # Sidebar: file upload and filters
    with st.sidebar:
        st.header("Data Input")
        uploaded_file = st.file_uploader(
            "Choose a file", type=["csv", "xls", "xlsx"], key="file_upload"
        )
        if uploaded_file is not None:
            df_raw = load_data(uploaded_file)
            if df_raw is not None and validate_columns(df_raw):
                # Process the data
                df_enriched, summary_df = compute_metrics(df_raw.copy())

                # Account filter
                accounts = sorted(df_enriched["Account_ID"].unique())
                selected_accounts = st.multiselect(
                    "Filter accounts",
                    options=accounts,
                    default=accounts,
                )
                # Date range filter
                min_date = df_enriched["Date"].min().date()
                max_date = df_enriched["Date"].max().date()
                date_range = st.date_input(
                    "Select date range",
                    value=(min_date, max_date),
                    min_value=min_date,
                    max_value=max_date,
                )
                if len(date_range) == 2:
                    start_date, end_date = date_range
                else:
                    start_date, end_date = min_date, max_date
            else:
                df_enriched = None
                summary_df = None
                selected_accounts = []
                start_date = end_date = None
        else:
            df_enriched = None
            summary_df = None
            selected_accounts = []
            start_date = end_date = None

    if df_enriched is None:
        st.info("👆 Please upload a file to begin.")
        return

    # Filter by accounts and date
    mask = (
        df_enriched["Account_ID"].isin(selected_accounts)
        & (df_enriched["Date"].dt.date >= start_date)
        & (df_enriched["Date"].dt.date <= end_date)
    )
    df_filtered = df_enriched[mask].copy()

    if df_filtered.empty:
        st.warning("No data available for the selected filters.")
        return

    # ------------------------------
    # Summary Metrics Cards
    # ------------------------------
    st.header("Overview")
    # Overall metrics: sum across all selected accounts at their latest dates
    latest_per_account = (
        df_filtered.loc[df_filtered.groupby("Account_ID")["Date"].idxmax()]
        [["Account_ID", "Total_Equity", "Cumulative_Profit", "Total_Net_Cash_Flow"]]
    )
    total_equity = latest_per_account["Total_Equity"].sum()
    total_profit = latest_per_account["Cumulative_Profit"].sum()
    total_net_deposits = latest_per_account["Total_Net_Cash_Flow"].sum()
    overall_roi = total_profit / total_net_deposits if total_net_deposits != 0 else None

    col1, col2, col3 = st.columns(3)
    col1.metric("💰 Total Equity", f"${total_equity:,.2f}")
    col2.metric("📈 Total Net Profit", f"${total_profit:,.2f}")
    col3.metric(
        "📊 Overall ROI",
        f"{overall_roi:.2%}" if overall_roi is not None else "N/A",
        help="Total Cumulative Profit / Total Net Deposits (sum of all cash flows)",
    )

    # Per-account summary table
    st.subheader("Account Summary")
    st.dataframe(
        summary_df[summary_df["Account_ID"].isin(selected_accounts)]
        .rename(columns={
            "Account_ID": "Account",
            "Cumulative_Profit": "Cumulative Profit ($)",
            "Total_Net_Cash_Flow": "Net Cash Flow ($)",
            "ROI": "ROI",
        })
        .style.format({
            "Cumulative Profit ($)": "${:,.2f}",
            "Net Cash Flow ($)": "${:,.2f}",
            "ROI": lambda x: f"{x:.2%}" if pd.notna(x) else "N/A",
        }),
        use_container_width=True,
    )

    # ------------------------------
    # Daily Profit Chart
    # ------------------------------
    st.header("Daily Profit/Loss")
    fig_daily = px.bar(
        df_filtered,
        x="Date",
        y="Daily_Profit",
        color="Account_ID",
        title="Daily Profit (adjusted for cash flows)",
        labels={"Daily_Profit": "Profit ($)"},
        barmode="group",
    )
    fig_daily.update_layout(hovermode="x unified")
    st.plotly_chart(fig_daily, use_container_width=True)

    # ------------------------------
    # Equity Curve
    # ------------------------------
    st.header("Equity Curve")
    fig_equity = px.line(
        df_filtered,
        x="Date",
        y="Total_Equity",
        color="Account_ID",
        title="Total Equity Over Time",
        labels={"Total_Equity": "Equity ($)"},
    )
    fig_equity.update_layout(hovermode="x unified")
    st.plotly_chart(fig_equity, use_container_width=True)

    # ------------------------------
    # Cumulative Profit Curve (bonus)
    # ------------------------------
    st.header("Cumulative Profit")
    fig_cum = px.line(
        df_filtered,
        x="Date",
        y="Cumulative_Profit",
        color="Account_ID",
        title="Cumulative Profit (adjusted for cash flows)",
        labels={"Cumulative_Profit": "Cumulative Profit ($)"},
    )
    fig_cum.update_layout(hovermode="x unified")
    st.plotly_chart(fig_cum, use_container_width=True)

    # ------------------------------
    # Raw Data (collapsible)
    # ------------------------------
    with st.expander("🔍 View Processed Data"):
        st.dataframe(
            df_filtered[[
                "Date", "Account_ID", "Portfolio_Value", "Cash_Balance",
                "Net_Cash_Flow", "Total_Equity", "Daily_Profit", "Cumulative_Profit"
            ]].sort_values(["Account_ID", "Date"]),
            use_container_width=True,
        )

if __name__ == "__main__":
    main()