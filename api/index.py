"""
Portfolio Performance Tracker - calculation service.

Runs as a Vercel Python serverless function. Exposes a single endpoint,
POST /api/calculate, which accepts a JSON array of daily portfolio
snapshots and returns the same data enriched with daily/cumulative
profit and per-account ROI, computed with pandas.
"""

from __future__ import annotations

import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)

REQUIRED_FIELDS = [
    "date",
    "account_id",
    "portfolio_value",
    "cash_balance",
    "net_cash_flow",
]


def _validate_payload(payload):
    if not isinstance(payload, list):
        return "Request body must be a JSON array of records."
    if len(payload) == 0:
        return None  # empty is valid, just yields empty results
    for i, row in enumerate(payload):
        if not isinstance(row, dict):
            return f"Record at index {i} must be an object."
        missing = [f for f in REQUIRED_FIELDS if f not in row]
        if missing:
            return f"Record at index {i} is missing field(s): {', '.join(missing)}."
    return None


def calculate(payload: list[dict]) -> dict:
    if len(payload) == 0:
        return {"records": [], "summary": []}

    df = pd.DataFrame(payload)

    # Coerce types defensively so malformed numeric strings don't crash pandas.
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    for col in ["portfolio_value", "cash_balance", "net_cash_flow"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
    df["account_id"] = df["account_id"].astype(str)

    # 2. Total equity
    df["Total_Equity"] = df["portfolio_value"] + df["cash_balance"]

    # 3. Sort by account then date so diff()/cumsum() work per-account in order.
    df = df.sort_values(["account_id", "date"]).reset_index(drop=True)

    # 4. Daily profit = (today's equity - yesterday's equity) - today's net cash flow.
    #    First entry of each account has no prior day, so it gets 0.
    prev_equity = df.groupby("account_id")["Total_Equity"].shift(1)
    df["Daily_Profit"] = (df["Total_Equity"] - prev_equity) - df["net_cash_flow"]
    df["Daily_Profit"] = df["Daily_Profit"].fillna(0.0)

    # 5. Cumulative profit per account.
    df["Cumulative_Profit"] = df.groupby("account_id")["Daily_Profit"].cumsum()

    # 6. Total net flow per account (attach as a column for convenience, used in summary).
    total_net_flow_by_account = df.groupby("account_id")["net_cash_flow"].sum()

    # Build the enriched records list, restoring the original ISO date string.
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")

    records = []
    for _, row in df.iterrows():
        records.append(
            {
                "date": row["date"],
                "account_id": row["account_id"],
                "portfolio_value": float(row["portfolio_value"]),
                "cash_balance": float(row["cash_balance"]),
                "net_cash_flow": float(row["net_cash_flow"]),
                "total_equity": float(row["Total_Equity"]),
                "daily_profit": float(row["Daily_Profit"]),
                "cumulative_profit": float(row["Cumulative_Profit"]),
            }
        )

    # 8. Summary per account: latest total equity, latest cumulative profit,
    #    total net flow, and ROI = cumulative_profit / total_net_flow.
    summary = []
    for account_id, group in df.groupby("account_id"):
        latest = group.iloc[-1]
        total_net_flow = float(total_net_flow_by_account[account_id])
        cumulative_profit = float(latest["Cumulative_Profit"])
        roi = (cumulative_profit / total_net_flow) if total_net_flow != 0 else None
        summary.append(
            {
                "account_id": account_id,
                "total_equity": float(latest["Total_Equity"]),
                "cumulative_profit": cumulative_profit,
                "total_net_flow": total_net_flow,
                "roi": roi,
            }
        )

    return {"records": records, "summary": summary}


@app.route("/api/calculate", methods=["POST"])
def calculate_endpoint():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    error = _validate_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    try:
        result = calculate(payload)
    except Exception as exc:  # noqa: BLE001 - surface calculation errors to the client
        return jsonify({"error": f"Calculation failed: {exc}"}), 500

    return jsonify(result)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)
