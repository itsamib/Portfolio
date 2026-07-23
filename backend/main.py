from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import json
import os
from datetime import datetime

from calculations import compute_metrics

app = FastAPI(title="Portfolio Performance Tracker API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
records: List[Dict[str, Any]] = []
accounts: set = set()

DATA_FILE = "data.json"


class PortfolioRecord(BaseModel):
    """Portfolio snapshot record."""
    date: str
    account_id: str
    portfolio_value: float
    cash_balance: float
    net_cash_flow: float


class AccountCreate(BaseModel):
    """Create new account."""
    name: str


def load_data():
    """Load data from JSON file if it exists."""
    global records, accounts
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            records = data.get("records", [])
            accounts = set(data.get("accounts", []))


def save_data():
    """Save data to JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump({
            "records": records,
            "accounts": list(accounts)
        }, f, indent=2)


# Load data on startup
load_data()


@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/accounts")
def get_accounts() -> Dict[str, Any]:
    """
    Get all unique account IDs.
    
    Returns:
        {"accounts": [list of account IDs]}
    """
    return {"accounts": sorted(list(accounts))}


@app.post("/api/records")
def add_record(record: PortfolioRecord) -> Dict[str, Any]:
    """
    Add a new portfolio record.
    
    Args:
        record: Portfolio snapshot
    
    Returns:
        {"id": record_id, "message": "Record added"}
    """
    record_dict = {
        "id": len(records),
        "date": record.date,
        "account_id": record.account_id,
        "portfolio_value": record.portfolio_value,
        "cash_balance": record.cash_balance,
        "net_cash_flow": record.net_cash_flow,
    }
    records.append(record_dict)
    accounts.add(record.account_id)
    save_data()
    return {"id": record_dict["id"], "message": "Record added successfully"}


@app.get("/api/records")
def get_records() -> Dict[str, Any]:
    """
    Get all records.
    
    Returns:
        {"records": [list of all records]}
    """
    return {"records": records}


@app.delete("/api/records/{record_id}")
def delete_record(record_id: int) -> Dict[str, Any]:
    """
    Delete a record by ID.
    
    Args:
        record_id: ID of record to delete
    
    Returns:
        {"message": "Record deleted"}
    """
    global records
    if record_id < 0 or record_id >= len(records):
        raise HTTPException(status_code=404, detail="Record not found")
    records.pop(record_id)
    # Re-index
    records = [{**r, "id": idx} for idx, r in enumerate(records)]
    save_data()
    return {"message": "Record deleted successfully"}


@app.put("/api/records/{record_id}")
def update_record(record_id: int, record: PortfolioRecord) -> Dict[str, Any]:
    """
    Update a record by ID.
    
    Args:
        record_id: ID of record to update
        record: Updated record data
    
    Returns:
        {"message": "Record updated"}
    """
    if record_id < 0 or record_id >= len(records):
        raise HTTPException(status_code=404, detail="Record not found")
    
    records[record_id] = {
        "id": record_id,
        "date": record.date,
        "account_id": record.account_id,
        "portfolio_value": record.portfolio_value,
        "cash_balance": record.cash_balance,
        "net_cash_flow": record.net_cash_flow,
    }
    accounts.add(record.account_id)
    save_data()
    return {"message": "Record updated successfully"}


@app.post("/api/calculate")
def calculate(records_list: List[PortfolioRecord]) -> Dict[str, Any]:
    """
    Calculate metrics for given records.
    
    Args:
        records_list: List of portfolio records
    
    Returns:
        {
            "enriched_data": [...],
            "summary": [...],
            "total_equity": float,
            "total_profit": float,
            "overall_roi": float or null
        }
    """
    if not records_list:
        return {
            "enriched_data": [],
            "summary": [],
            "total_equity": 0,
            "total_profit": 0,
            "overall_roi": None,
        }
    
    # Convert to DataFrame
    data = [{
        "Date": r.date,
        "Account_ID": r.account_id,
        "Portfolio_Value": r.portfolio_value,
        "Cash_Balance": r.cash_balance,
        "Net_Cash_Flow": r.net_cash_flow,
    } for r in records_list]
    
    df = pd.DataFrame(data)
    enriched_df, summary_df = compute_metrics(df)
    
    # Prepare response
    enriched_data = enriched_df.to_dict(orient="records")
    summary_data = summary_df.to_dict(orient="records")
    
    # Convert datetime objects to strings for JSON serialization
    for record in enriched_data:
        if isinstance(record.get("Date"), pd.Timestamp):
            record["Date"] = record["Date"].strftime("%Y-%m-%d")
    
    for record in summary_data:
        if isinstance(record.get("Date"), pd.Timestamp):
            record["Date"] = record["Date"].strftime("%Y-%m-%d")
    
    # Calculate overall metrics
    if not summary_df.empty:
        total_equity = summary_df["Total_Equity"].sum()
        total_profit = summary_df["Cumulative_Profit"].sum()
        total_net_deposits = summary_df["Total_Net_Cash_Flow"].sum()
        overall_roi = total_profit / total_net_deposits if total_net_deposits != 0 else None
    else:
        total_equity = 0
        total_profit = 0
        overall_roi = None
    
    return {
        "enriched_data": enriched_data,
        "summary": summary_data,
        "total_equity": float(total_equity),
        "total_profit": float(total_profit),
        "overall_roi": float(overall_roi) if overall_roi is not None else None,
    }


@app.post("/api/accounts")
def create_account(account: AccountCreate) -> Dict[str, Any]:
    """
    Create a new account.
    
    Args:
        account: Account name
    
    Returns:
        {"account_id": account_name, "message": "Account created"}
    """
    account_id = account.name
    if account_id in accounts:
        raise HTTPException(status_code=400, detail="Account already exists")
    accounts.add(account_id)
    save_data()
    return {"account_id": account_id, "message": "Account created successfully"}


@app.delete("/api/accounts/{account_id}")
def delete_account(account_id: str) -> Dict[str, Any]:
    """
    Delete an account and all its records.
    
    Args:
        account_id: ID of account to delete
    
    Returns:
        {"message": "Account deleted"}
    """
    global records
    if account_id not in accounts:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Remove all records for this account
    records = [r for r in records if r["account_id"] != account_id]
    # Re-index
    records = [{**r, "id": idx} for idx, r in enumerate(records)]
    
    accounts.discard(account_id)
    save_data()
    return {"message": "Account deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
