import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path to import calculations
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.calculations import compute_metrics

# Page config
st.set_page_config(
    page_title="Portfolio Performance Tracker",
    layout="wide",
    initial_sidebar_state="expanded",
    theme="dark"
)

# Custom CSS for glassmorphism
st.markdown("""
<style>
    [data-testid="stSidebar"] {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
    }
    
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .glass-container {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'records' not in st.session_state:
    st.session_state.records = [
        {'date': '2024-01-01', 'account_id': 'ACC001', 'portfolio_value': 10000, 'cash_balance': 500, 'net_cash_flow': 500},
        {'date': '2024-01-02', 'account_id': 'ACC001', 'portfolio_value': 10500, 'cash_balance': 400, 'net_cash_flow': 0},
        {'date': '2024-01-03', 'account_id': 'ACC001', 'portfolio_value': 10800, 'cash_balance': 600, 'net_cash_flow': -100},
        {'date': '2024-01-01', 'account_id': 'ACC002', 'portfolio_value': 50000, 'cash_balance': 2000, 'net_cash_flow': 2000},
        {'date': '2024-01-02', 'account_id': 'ACC002', 'portfolio_value': 51200, 'cash_balance': 1800, 'net_cash_flow': 0},
        {'date': '2024-01-03', 'account_id': 'ACC002', 'portfolio_value': 51800, 'cash_balance': 2200, 'net_cash_flow': 500},
    ]

if 'accounts' not in st.session_state:
    st.session_state.accounts = ['ACC001', 'ACC002']

def get_enriched_data():
    """Convert records to DataFrame and calculate metrics"""
    if not st.session_state.records:
        return pd.DataFrame(), pd.DataFrame()
    
    df = pd.DataFrame(st.session_state.records)
    enriched_df, summary_df = compute_metrics(df)
    return enriched_df, summary_df

def format_currency(value):
    """Format number as currency"""
    return f"${value:,.2f}"

def format_percentage(value):
    """Format number as percentage"""
    return f"{value * 100:.2f}%"

# Sidebar Navigation
with st.sidebar:
    st.markdown("### 📊 Portfolio Tracker")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["📈 Master Dashboard", "📝 Data Entry", "👥 Accounts", "📉 Account Details"]
    )

# Main Pages
if page == "📈 Master Dashboard":
    st.title("📈 Master Dashboard")
    st.markdown("Overall portfolio performance across all accounts")
    st.markdown("---")
    
    enriched_df, summary_df = get_enriched_data()
    
    if not summary_df.empty:
        # Calculate overall metrics
        total_equity = summary_df['Total_Equity'].sum()
        total_profit = summary_df['Cumulative_Profit'].sum()
        total_net_deposits = summary_df['Total_Net_Cash_Flow'].sum()
        overall_roi = total_profit / total_net_deposits if total_net_deposits != 0 else 0
        
        # Metrics Cards
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">💰 Total Equity</h4>
                <h2 style="color: #fff; margin: 0; font-size: 2rem;">{format_currency(total_equity)}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            profit_color = "#10b981" if total_profit > 0 else "#ef4444"
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">📈 Total Profit</h4>
                <h2 style="color: {profit_color}; margin: 0; font-size: 2rem;">{format_currency(total_profit)}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            roi_color = "#10b981" if overall_roi > 0 else "#ef4444"
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">📊 Overall ROI</h4>
                <h2 style="color: {roi_color}; margin: 0; font-size: 2rem;">{format_percentage(overall_roi)}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Summary Table
        st.subheader("Account Summary")
        summary_display = summary_df.copy()
        summary_display['Total_Equity'] = summary_display['Total_Equity'].apply(format_currency)
        summary_display['Cumulative_Profit'] = summary_display['Cumulative_Profit'].apply(format_currency)
        summary_display['Total_Net_Cash_Flow'] = summary_display['Total_Net_Cash_Flow'].apply(format_currency)
        summary_display['ROI'] = summary_display['ROI'].apply(format_percentage)
        
        st.dataframe(
            summary_display[['Account_ID', 'Total_Equity', 'Cumulative_Profit', 'Total_Net_Cash_Flow', 'ROI']],
            use_container_width=True,
            hide_index=True
        )
        
        st.markdown("---")
        
        # Charts
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Daily Profit/Loss")
            daily_profit_data = enriched_df.pivot_table(
                index='Date',
                columns='Account_ID',
                values='Daily_Profit',
                aggfunc='first'
            ).reset_index()
            
            fig = px.bar(
                daily_profit_data,
                x='Date',
                y=[col for col in daily_profit_data.columns if col != 'Date'],
                barmode='group',
                template='plotly_dark',
                color_discrete_sequence=['#3b82f6', '#10b981', '#f59e0b']
            )
            fig.update_layout(height=400, showlegend=True, hovermode='x unified')
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Total Equity Over Time")
            equity_data = enriched_df.pivot_table(
                index='Date',
                columns='Account_ID',
                values='Total_Equity',
                aggfunc='first'
            ).reset_index()
            
            fig = px.line(
                equity_data,
                x='Date',
                y=[col for col in equity_data.columns if col != 'Date'],
                template='plotly_dark',
                color_discrete_sequence=['#3b82f6', '#10b981', '#f59e0b']
            )
            fig.update_layout(height=400, showlegend=True, hovermode='x unified')
            st.plotly_chart(fig, use_container_width=True)
        
        st.markdown("---")
        
        # Cumulative Profit Chart
        st.subheader("Cumulative Profit")
        cumulative_data = enriched_df.pivot_table(
            index='Date',
            columns='Account_ID',
            values='Cumulative_Profit',
            aggfunc='first'
        ).reset_index()
        
        fig = px.area(
            cumulative_data,
            x='Date',
            y=[col for col in cumulative_data.columns if col != 'Date'],
            template='plotly_dark',
            color_discrete_sequence=['#3b82f6', '#10b981', '#f59e0b']
        )
        fig.update_layout(height=400, showlegend=True, hovermode='x unified')
        st.plotly_chart(fig, use_container_width=True)
        
    else:
        st.info("📊 No data yet. Start by adding portfolio records in the Data Entry section.")

elif page == "📝 Data Entry":
    st.title("📝 Data Entry")
    st.markdown("Add new portfolio snapshots manually")
    st.markdown("---")
    
    # Form
    col1, col2 = st.columns(2)
    
    with col1:
        entry_date = st.date_input(
            "Date",
            value=datetime.now(),
            key="entry_date"
        )
    
    with col2:
        account = st.selectbox(
            "Account",
            options=st.session_state.accounts,
            key="entry_account"
        )
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        portfolio_value = st.number_input(
            "Portfolio Value ($)",
            min_value=0.0,
            value=10000.0,
            step=100.0,
            key="portfolio_value"
        )
    
    with col2:
        cash_balance = st.number_input(
            "Cash Balance ($)",
            min_value=0.0,
            value=500.0,
            step=100.0,
            key="cash_balance"
        )
    
    with col3:
        net_cash_flow = st.number_input(
            "Net Cash Flow ($)",
            value=0.0,
            step=100.0,
            key="net_cash_flow"
        )
    
    if st.button("➕ Add Record", use_container_width=True):
        new_record = {
            'date': entry_date.strftime('%Y-%m-%d'),
            'account_id': account,
            'portfolio_value': portfolio_value,
            'cash_balance': cash_balance,
            'net_cash_flow': net_cash_flow
        }
        st.session_state.records.append(new_record)
        st.success("✅ Record added successfully!")
    
    st.markdown("---")
    
    # Records Table
    st.subheader("All Records")
    if st.session_state.records:
        records_df = pd.DataFrame(st.session_state.records)
        records_df['Actions'] = ''
        
        # Display table
        st.dataframe(
            records_df[['date', 'account_id', 'portfolio_value', 'cash_balance', 'net_cash_flow']],
            use_container_width=True,
            hide_index=True,
            column_config={
                'date': 'Date',
                'account_id': 'Account',
                'portfolio_value': 'Portfolio Value',
                'cash_balance': 'Cash Balance',
                'net_cash_flow': 'Net Cash Flow'
            }
        )
        
        # Delete functionality
        st.markdown("---")
        delete_idx = st.number_input(
            "Select record index to delete (or -1 to skip)",
            min_value=-1,
            max_value=len(st.session_state.records) - 1,
            value=-1
        )
        
        if delete_idx >= 0:
            if st.button("🗑️ Delete Selected Record"):
                st.session_state.records.pop(delete_idx)
                st.success("✅ Record deleted!")
                st.rerun()
    else:
        st.info("No records yet. Add one above.")

elif page == "👥 Accounts":
    st.title("👥 Account Management")
    st.markdown("Create and manage your trading accounts")
    st.markdown("---")
    
    # Create new account
    st.subheader("Create New Account")
    new_account_name = st.text_input(
        "Account Name",
        placeholder="e.g., Trading Account 1",
        key="new_account"
    )
    
    if st.button("➕ Create Account", use_container_width=True):
        if new_account_name and new_account_name not in st.session_state.accounts:
            st.session_state.accounts.append(new_account_name)
            st.success(f"✅ Account '{new_account_name}' created!")
        elif new_account_name in st.session_state.accounts:
            st.error(f"❌ Account '{new_account_name}' already exists!")
        else:
            st.error("❌ Please enter an account name.")
    
    st.markdown("---")
    
    # List accounts
    st.subheader("Your Accounts")
    if st.session_state.accounts:
        col1, col2, col3 = st.columns(3)
        
        for idx, account in enumerate(st.session_state.accounts):
            with [col1, col2, col3][idx % 3]:
                st.markdown(f"""
                <div class="glass-container">
                    <h3 style="margin: 0 0 0.5rem 0;">{account}</h3>
                    <p style="margin: 0 0 1rem 0; color: #888; font-size: 0.9rem;">Trading Account</p>
                </div>
                """, unsafe_allow_html=True)
                
                if st.button(f"🗑️ Delete {account}", key=f"delete_{account}", use_container_width=True):
                    if st.checkbox(f"Confirm delete {account}?", key=f"confirm_{account}"):
                        st.session_state.accounts.remove(account)
                        st.session_state.records = [
                            r for r in st.session_state.records
                            if r['account_id'] != account
                        ]
                        st.success(f"✅ Account '{account}' deleted!")
                        st.rerun()
    else:
        st.info("No accounts yet. Create one above.")

elif page == "📉 Account Details":
    st.title("📉 Account Details")
    st.markdown("Individual account performance")
    st.markdown("---")
    
    selected_account = st.selectbox(
        "Select Account",
        options=st.session_state.accounts
    )
    
    # Filter data for selected account
    enriched_df, summary_df = get_enriched_data()
    
    account_data = enriched_df[enriched_df['Account_ID'] == selected_account]
    
    if not account_data.empty:
        latest = account_data.iloc[-1]
        total_flow = account_data['Total_Net_Cash_Flow'].iloc[0]
        
        # Metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">Total Equity</h4>
                <h2 style="color: #fff; margin: 0; font-size: 1.8rem;">{format_currency(latest['Total_Equity'])}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            profit_color = "#10b981" if latest['Cumulative_Profit'] > 0 else "#ef4444"
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">Cumulative Profit</h4>
                <h2 style="color: {profit_color}; margin: 0; font-size: 1.8rem;">{format_currency(latest['Cumulative_Profit'])}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">Net Cash Flow</h4>
                <h2 style="color: #fff; margin: 0; font-size: 1.8rem;">{format_currency(total_flow)}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            roi = latest['Cumulative_Profit'] / total_flow if total_flow != 0 else 0
            roi_color = "#10b981" if roi > 0 else "#ef4444"
            st.markdown(f"""
            <div class="metric-card">
                <h4 style="color: #888; margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase;">ROI</h4>
                <h2 style="color: {roi_color}; margin: 0; font-size: 1.8rem;">{format_percentage(roi)}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Charts
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Total Equity Over Time")
            equity_data = account_data[['Date', 'Total_Equity']].copy()
            
            fig = px.line(
                equity_data,
                x='Date',
                y='Total_Equity',
                template='plotly_dark',
                color_discrete_sequence=['#3b82f6']
            )
            fig.update_layout(height=400, showlegend=False, hovermode='x unified')
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Daily Profit/Loss")
            daily_profit_data = account_data[['Date', 'Daily_Profit']].copy()
            
            fig = px.bar(
                daily_profit_data,
                x='Date',
                y='Daily_Profit',
                template='plotly_dark',
                color_discrete_sequence=['#10b981']
            )
            fig.update_layout(height=400, showlegend=False, hovermode='x unified')
            st.plotly_chart(fig, use_container_width=True)
        
        st.markdown("---")
        
        st.subheader("Cumulative Profit Over Time")
        cumulative_data = account_data[['Date', 'Cumulative_Profit']].copy()
        
        fig = px.area(
            cumulative_data,
            x='Date',
            y='Cumulative_Profit',
            template='plotly_dark',
            color_discrete_sequence=['#06b6d4']
        )
        fig.update_layout(height=400, showlegend=False, hovermode='x unified')
        st.plotly_chart(fig, use_container_width=True)
        
    else:
        st.info(f"📊 No data available for {selected_account}. Add records in the Data Entry section.")
