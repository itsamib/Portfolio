"use client";

import { FormEvent, useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import DataTable, { DataTableColumn } from "@/components/DataTable";
import { PortfolioRecord } from "@/lib/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DataEntryPage() {
  const { accounts, records, addRecord, deleteRecord } = useData();

  const [date, setDate] = useState(todayIso());
  const [accountId, setAccountId] = useState("");
  const [portfolioValue, setPortfolioValue] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [netCashFlow, setNetCashFlow] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  const nameMap = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) => b.date.localeCompare(a.date) || a.account_id.localeCompare(b.account_id)
      ),
    [records]
  );

  function resetForm() {
    setDate(todayIso());
    setPortfolioValue("");
    setCashBalance("");
    setNetCashFlow("0");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!accountId) {
      setFormError("Select an account.");
      return;
    }
    const pv = parseFloat(portfolioValue);
    const cb = parseFloat(cashBalance);
    const ncf = parseFloat(netCashFlow || "0");

    if (Number.isNaN(pv) || Number.isNaN(cb) || Number.isNaN(ncf)) {
      setFormError("Portfolio value, cash balance, and net cash flow must be numbers.");
      return;
    }

    addRecord({
      date,
      account_id: accountId,
      portfolio_value: pv,
      cash_balance: cb,
      net_cash_flow: ncf,
    });
    resetForm();
  }

  const columns: DataTableColumn<PortfolioRecord>[] = [
    { key: "date", header: "Date", render: (r) => r.date },
    {
      key: "account",
      header: "Account",
      render: (r) => nameMap[r.account_id] ?? "Unknown account",
    },
    {
      key: "portfolio_value",
      header: "Portfolio Value",
      align: "right",
      render: (r) => r.portfolio_value.toLocaleString(undefined, { style: "currency", currency: "USD" }),
    },
    {
      key: "cash_balance",
      header: "Cash Balance",
      align: "right",
      render: (r) => r.cash_balance.toLocaleString(undefined, { style: "currency", currency: "USD" }),
    },
    {
      key: "net_cash_flow",
      header: "Net Cash Flow",
      align: "right",
      render: (r) => r.net_cash_flow.toLocaleString(undefined, { style: "currency", currency: "USD" }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Entry</h1>
        <p className="text-gray-400 text-sm mt-1">
          Log daily portfolio value, cash balance, and net cash flow per account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-5 flex flex-col gap-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500">
            You need at least one account before adding records. Create one on
            the Accounts page.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="glass-input"
                  required
                >
                  <option value="" disabled>
                    Select account
                  </option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Portfolio Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  className="glass-input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Cash Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(e.target.value)}
                  className="glass-input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Net Cash Flow</label>
                <input
                  type="number"
                  step="0.01"
                  value={netCashFlow}
                  onChange={(e) => setNetCashFlow(e.target.value)}
                  className="glass-input"
                  placeholder="0.00"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-loss">{formError}</p>}

            <div>
              <button type="submit" className="glass-button">
                Add record
              </button>
            </div>
          </>
        )}
      </form>

      <DataTable
        columns={columns}
        rows={sortedRecords}
        getRowId={(r) => r.id}
        onDelete={(r) => deleteRecord(r.id)}
        emptyMessage="No records logged yet."
      />
    </div>
  );
}
