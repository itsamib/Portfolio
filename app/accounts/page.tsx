"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import BackButton from "@/components/BackButton";
import { t } from "@/lib/i18n";

export default function AccountsPage() {
  const { accounts, records, addAccount, deleteAccount } = useData();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isRtl = language === "fa";

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
      setError(t("accounts.enterName", language));
      return;
    }
    if (accounts.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) {
      setError(t("accounts.exists", language));
      return;
    }
    addAccount(name);
    setName("");
  }

  function handleDelete(id: string, accountName: string) {
    const recordCount = recordCountByAccount[id] ?? 0;
    const confirmMessage = isRtl
      ? `آیا از حذف حساب "${accountName}" با ${recordCount} رکورد مطمئن هستید؟`
      : `Delete "${accountName}" and its ${recordCount} record(s)?`;

    if (window.confirm(confirmMessage)) {
      deleteAccount(id);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t("accounts.title", language)}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {t("accounts.subtitle", language)}
          </p>
        </div>
        <div>
          <BackButton />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("accounts.placeholder", language)}
          className="glass-input flex-1"
        />
        <button type="submit" className="glass-button whitespace-nowrap">
          {t("accounts.createAccount", language)}
        </button>
      </form>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400 -mt-4">{error}</p>}

      {accounts.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
          {t("accounts.noAccounts", language)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => {
            const count = recordCountByAccount[a.id] ?? 0;
            return (
              <div key={a.id} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-gray-100">{a.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                      {count} {isRtl ? "رکورد ثبت شده" : `record${count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id, a.name)}
                    aria-label={`Delete ${a.name}`}
                    className="text-slate-400 hover:text-rose-600 dark:text-gray-500 dark:hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  href={`/accounts/${a.id}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 mt-auto pt-2 font-medium"
                >
                  <span>{t("accounts.viewDashboard", language)}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
