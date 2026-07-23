"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";

export default function AccountsPage() {
  const { accounts, records, addAccount, deleteAccount } = useData();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recordCountByAccount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of records) {
      counts[r.account_id] = (counts[r.account_id] ?? 0) + 1;
    }
    return counts;
  }, [records]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Enter an account name.");
      return;
    }
    if (accounts.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("An account with that name already exists.");
      return;
    }
    addAccount(name);
    setName("");
  }

  function handleDelete(id: string, accountName: string) {
    const recordCount = recordCountByAccount[id] ?? 0;
    const message =
      recordCount > 0
        ? `Delete "${accountName}" and its ${recordCount} record${recordCount === 1 ? "" : "s"}?`
        : `Delete "${accountName}"?`;
    if (window.confirm(message)) {
      deleteAccount(id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <p className="text-gray-400 text-sm mt-1">
          Create and manage the accounts you track performance for.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Brokerage, Roth IRA, Crypto Wallet"
          className="glass-input flex-1"
        />
        <button type="submit" className="glass-button whitespace-nowrap">
          Create account
        </button>
      </form>
      {error && <p className="text-sm text-loss -mt-4">{error}</p>}

      {accounts.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-gray-500">
          No accounts yet. Create your first account above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="glass-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-100">{a.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {recordCountByAccount[a.id] ?? 0} record
                    {(recordCountByAccount[a.id] ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  aria-label={`Delete ${a.name}`}
                  className="text-gray-500 hover:text-loss transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Link
                href={`/accounts/${a.id}`}
                className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 mt-auto"
              >
                View dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
