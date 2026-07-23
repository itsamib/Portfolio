import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
from src.calculations import compute_metrics  # ← از ماژول موجود استفاده می‌کنیم

# ------------------------------
# Page config & Dark Theme
# ------------------------------
st.set_page_config(
    page_title="Portfolio Tracker Pro",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for glassmorphism dark UI
st.markdown("""
<style>
    .stApp {
        background-color: #0E1117;
    }
    div[data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 16px;
    }
    .stButton>button {
        border-radius: 8px;
        background: linear-gradient(135deg, #6C63FF, #3F3D9E);
        color: white;
        border: none;
        font-weight: 600;
    }
    .stTextInput>div>div>input {
        border-radius: 8px;
    }
    .stSelectbox>div>div>div {
        border-radius: 8px;
    }
</style>
""", unsafe_allow_html=True)

# ------------------------------
# Session State Initialization
# ------------------------------
if 'accounts' not in st.session_state:
    st.session_state.accounts = ['Main Account']  # یک حساب پیش‌فرض
if 'data' not in st.session_state:
    st.session_state.data = pd.DataFrame(columns=[
        'Date', 'Account_ID', 'Portfolio_Value', 'Cash_Balance', 'Net_Cash_Flow'
    ])

# ------------------------------
# Sidebar Navigation
# ------------------------------
with st.sidebar:
    st.markdown("## 📊 Portfolio Pro")
    st.markdown("---")
    menu = st.radio(
        "Navigate",
        ["🏠 Master Dashboard", "➕ Data Entry", "📈 Account Dashboards", "⚙️ Manage Accounts"],
        label_visibility="collapsed"
    )
    st.markdown("---")
    st.caption("Manual input · Glass UI")

# ------------------------------
# Helper: get enriched data
# ------------------------------
if not st.session_state.data.empty:
    enriched_df, summary_df = compute_metrics(st.session_state.data.copy())
else:
    enriched_df, summary_df = pd.DataFrame(), pd.DataFrame()

# ------------------------------
# 1. Master Dashboard
# ------------------------------
if menu == "🏠 Master Dashboard":
    st.title("Master Portfolio Overview")
    if st.session_state.data.empty:
        st.info("👈 No data yet. Go to **Data Entry** to add your first record.")
    else:
        # Overall metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            total_equity = summary_df['Total_Equity'].sum()
            st.metric("💰 Total Equity", f"${total_equity:,.2f}")
        with col2:
            total_profit = summary_df['Cumulative_Profit'].sum()
            st.metric("📈 Total Net Profit", f"${total_profit:,.2f}")
        with col3:
            total_flows = summary_df['Total_Net_Flow'].sum()
            roi = total_profit / total_flows if total_flows != 0 else None
            st.metric("📊 Overall ROI", f"{roi:.2%}" if roi is not None else "N/A")

        st.markdown("---")
        st.subheader("Accounts at a Glance")
        # Apply color formatting on ROI column
        def color_roi(val):
            if isinstance(val, (int, float)):
                if val > 0:
                    return 'color: #00ff88'
                elif val < 0:
                    return 'color: #ff4b4b'
            return ''
        styled_summary = summary_df.style.format({
            'Total_Equity': '${:,.2f}',
            'Cumulative_Profit': '${:,.2f}',
            'Total_Net_Flow': '${:,.2f}',
            'ROI': '{:.2%}'
        }).map(color_roi, subset=['ROI'])
        st.dataframe(styled_summary, use_container_width=True)

        # Comparative charts
        st.markdown("### Performance Charts")
        fig_daily = px.bar(
            enriched_df,
            x='Date',
            y='Daily_Profit',
            color='Account_ID',
            title="Daily Profit by Account",
            template="plotly_dark",
            barmode='group'
        )
        st.plotly_chart(fig_daily, use_container_width=True)

        fig_equity = px.line(
            enriched_df,
            x='Date',
            y='Total_Equity',
            color='Account_ID',
            title="Equity Curves",
            template="plotly_dark"
        )
        st.plotly_chart(fig_equity, use_container_width=True)

# ------------------------------
# 2. Data Entry
# ------------------------------
elif menu == "➕ Data Entry":
    st.title("Manual Data Entry")
    if not st.session_state.accounts:
        st.warning("Create an account first in 'Manage Accounts'.")
    else:
        with st.form("entry_form", clear_on_submit=True):
            cols = st.columns([2, 2, 2, 2, 2])
            date = cols[0].date_input("Date", datetime.now().date())
            account = cols[1].selectbox("Account", st.session_state.accounts)
            portfolio_val = cols[2].number_input("Portfolio Value ($)", min_value=0.0, value=0.0, format="%.2f")
            cash = cols[3].number_input("Cash Balance ($)", min_value=0.0, value=0.0, format="%.2f")
            net_flow = cols[4].number_input("Net Cash Flow ($)", value=0.0, format="%.2f")
            submitted = st.form_submit_button("➕ Add Record")
            if submitted:
                new_row = pd.DataFrame([{
                    'Date': pd.to_datetime(date),
                    'Account_ID': account,
                    'Portfolio_Value': portfolio_val,
                    'Cash_Balance': cash,
                    'Net_Cash_Flow': net_flow
                }])
                st.session_state.data = pd.concat([st.session_state.data, new_row], ignore_index=True)
                st.success(f"Record added for {account} on {date}!")

        # Editable table of existing records
        st.markdown("### Existing Records")
        if not st.session_state.data.empty:
            edited_df = st.data_editor(
                st.session_state.data,
                num_rows="dynamic",
                use_container_width=True,
                key="data_editor"
            )
            if st.button("💾 Save Changes"):
                st.session_state.data = edited_df
                st.success("Data updated!")
                st.rerun()
        else:
            st.info("No records yet. Use the form above.")

# ------------------------------
# 3. Account Dashboards
# ------------------------------
elif menu == "📈 Account Dashboards":
    st.title("Individual Account Dashboard")
    if not st.session_state.accounts:
        st.warning("No accounts defined. Go to Manage Accounts first.")
    else:
        selected_account = st.selectbox("Choose Account", st.session_state.accounts)
        if st.session_state.data.empty:
            st.info("No data available. Add some records first.")
        else:
            acc_df = enriched_df[enriched_df['Account_ID'] == selected_account]
            if acc_df.empty:
                st.info(f"No records for {selected_account} yet.")
            else:
                latest = acc_df.iloc[-1]
                col1, col2, col3, col4 = st.columns(4)
                col1.metric("Total Equity", f"${latest['Total_Equity']:,.2f}")
                col2.metric("Cumulative Profit", f"${latest['Cumulative_Profit']:,.2f}")
                col3.metric("Net Cash Flow (total)", f"${latest['Total_Net_Flow']:,.2f}")
                col4.metric("ROI", f"{latest['ROI']:.2%}" if pd.notna(latest['ROI']) else "N/A")

                fig_eq = px.line(acc_df, x='Date', y='Total_Equity', title="Equity Curve", template="plotly_dark")
                st.plotly_chart(fig_eq, use_container_width=True)

                fig_daily = px.bar(acc_df, x='Date', y='Daily_Profit', title="Daily Profit", template="plotly_dark")
                st.plotly_chart(fig_daily, use_container_width=True)

                fig_cum = px.area(acc_df, x='Date', y='Cumulative_Profit', title="Cumulative Profit", template="plotly_dark")
                st.plotly_chart(fig_cum, use_container_width=True)

# ------------------------------
# 4. Manage Accounts
# ------------------------------
elif menu == "⚙️ Manage Accounts":
    st.title("Account Management")
    new_acc = st.text_input("New Account Name")
    if st.button("Create Account"):
        if new_acc.strip() and new_acc not in st.session_state.accounts:
            st.session_state.accounts.append(new_acc.strip())
            st.success(f"Account '{new_acc}' created!")
        elif new_acc in st.session_state.accounts:
            st.error("Account already exists.")
        else:
            st.warning("Enter a valid name.")
    st.markdown("### Existing Accounts")
    for acc in st.session_state.accounts:
        col1, col2 = st.columns([4, 1])
        col1.write(acc)
        if col2.button("Delete", key=f"del_{acc}"):
            st.session_state.accounts.remove(acc)
            st.rerun()
