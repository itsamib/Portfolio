"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Account, PortfolioRecord, CurrencyUnit, CashInterestItem } from "@/lib/types";
import { toPersianDate } from "@/lib/persianDate";

const ACCOUNTS_KEY = "ppt_accounts";
const RECORDS_KEY = "ppt_records";
const CURRENCY_UNIT_KEY = "ppt_currency_unit";
const CASH_INTERESTS_KEY = "ppt_cash_interests";
const LAST_BACKUP_KEY = "ppt_last_backup_date";
const BACKUP_HISTORY_KEY = "ppt_backup_history";

export interface BackupSnapshot {
  id: string;
  createdAt: string; // ISO string
  jalaliDate: string; // Persian date time
  accountsCount: number;
  recordsCount: number;
  data: {
    accounts: Account[];
    records: PortfolioRecord[];
  };
}

interface DataContextValue {
  accounts: Account[];
  records: PortfolioRecord[];
  currencyUnit: CurrencyUnit;
  cashInterests: CashInterestItem[];
  dueCashInterests: CashInterestItem[];
  loaded: boolean;
  lastBackupDate: string | null;
  backupHistory: BackupSnapshot[];
  setCurrencyUnit: (unit: CurrencyUnit) => void;
  addAccount: (name: string) => void;
  deleteAccount: (id: string) => void;
  addRecord: (record: Omit<PortfolioRecord, "id">) => void;
  deleteRecord: (id: string) => void;
  addCashInterest: (item: Omit<CashInterestItem, "id" | "created_at">) => void;
  deleteCashInterest: (id: string) => void;
  settleCashInterest: (id: string, depositToPortfolio: boolean) => void;
  exportBackupData: () => { blob: Blob; filename: string };
  importBackupData: (imported: { accounts?: Account[]; records?: PortfolioRecord[] }) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [currencyUnit, setCurrencyUnitState] = useState<CurrencyUnit>("toman");
  const [cashInterests, setCashInterests] = useState<CashInterestItem[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const storedAccounts = safeParse<Account[]>(
      window.localStorage.getItem(ACCOUNTS_KEY),
      []
    );
    const storedRecords = safeParse<PortfolioRecord[]>(
      window.localStorage.getItem(RECORDS_KEY),
      []
    );
    const storedCurrency = (window.localStorage.getItem(CURRENCY_UNIT_KEY) as CurrencyUnit) || "toman";
    const storedInterests = safeParse<CashInterestItem[]>(
      window.localStorage.getItem(CASH_INTERESTS_KEY),
      []
    );
    const storedLastBackup = window.localStorage.getItem(LAST_BACKUP_KEY);
    const storedHistory = safeParse<BackupSnapshot[]>(
      window.localStorage.getItem(BACKUP_HISTORY_KEY),
      []
    );

    setAccounts(storedAccounts);
    setRecords(storedRecords);
    setCurrencyUnitState(storedCurrency);
    setCashInterests(storedInterests);
    setLastBackupDate(storedLastBackup);
    setBackupHistory(storedHistory);
    setLoaded(true);
  }, []);

  // Persist accounts
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, loaded]);

  // Persist records
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records, loaded]);

  // Persist currency unit
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(CURRENCY_UNIT_KEY, currencyUnit);
  }, [currencyUnit, loaded]);

  // Persist cash interests
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(CASH_INTERESTS_KEY, JSON.stringify(cashInterests));
  }, [cashInterests, loaded]);

  // Persist backup history
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(backupHistory));
  }, [backupHistory, loaded]);

  function setCurrencyUnit(unit: CurrencyUnit) {
    setCurrencyUnitState(unit);
  }

  function addAccount(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const account: Account = {
      id: uuidv4(),
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, account]);
  }

  function deleteAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setRecords((prev) => prev.filter((r) => r.account_id !== id));
    setCashInterests((prev) => prev.filter((i) => i.account_id !== id));
  }

  function addRecord(record: Omit<PortfolioRecord, "id">) {
    const newRecord: PortfolioRecord = { id: uuidv4(), ...record };
    setRecords((prev) => [...prev, newRecord]);
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function addCashInterest(item: Omit<CashInterestItem, "id" | "created_at">) {
    const newItem: CashInterestItem = {
      ...item,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      is_settled: false,
    };
    setCashInterests((prev) => [...prev, newItem]);
  }

  function deleteCashInterest(id: string) {
    setCashInterests((prev) => prev.filter((i) => i.id !== id));
  }

  function settleCashInterest(id: string, depositToPortfolio: boolean) {
    const target = cashInterests.find((i) => i.id === id);
    if (!target) return;

    if (depositToPortfolio) {
      // Calculate profit amount based on rate and period
      const rateFraction = target.interest_rate / 100;
      const profit =
        target.interest_period === "monthly"
          ? target.principal_amount * rateFraction
          : target.principal_amount * rateFraction;

      const todayIso = new Date().toISOString().slice(0, 10);

      // Find latest record for this account to build on top
      const accountRecords = records.filter((r) => r.account_id === target.account_id);
      const latest = accountRecords.sort((a, b) => b.date.localeCompare(a.date))[0];

      const prevPortfolioVal = latest ? latest.portfolio_value : 0;
      const prevCashBal = latest ? latest.cash_balance : target.principal_amount;

      addRecord({
        date: todayIso,
        account_id: target.account_id,
        portfolio_value: prevPortfolioVal + profit,
        cash_balance: prevCashBal + profit,
        net_cash_flow: profit,
      });
    }

    // Mark as settled
    setCashInterests((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_settled: true } : i))
    );
  }

  // Find due cash interests where maturity_date <= today and !is_settled
  const dueCashInterests = useMemo(() => {
    if (!loaded) return [];
    const todayIso = new Date().toISOString().slice(0, 10);
    return cashInterests.filter(
      (item) => !item.is_settled && item.maturity_date && item.maturity_date <= todayIso
    );
  }, [cashInterests, loaded]);

  // Create local snapshot history item (max 5)
  function createSnapshot(accs: Account[], recs: PortfolioRecord[]) {
    const now = new Date();
    const iso = now.toISOString();
    const timeStr = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    const pDate = toPersianDate(now.toISOString().slice(0, 10));
    const jalaliDate = `${pDate} - ${timeStr}`;

    const newSnapshot: BackupSnapshot = {
      id: uuidv4(),
      createdAt: iso,
      jalaliDate,
      accountsCount: accs.length,
      recordsCount: recs.length,
      data: {
        accounts: accs,
        records: recs,
      },
    };

    setBackupHistory((prev) => [newSnapshot, ...prev].slice(0, 5));
  }

  // Export JSON file & save snapshot
  function exportBackupData() {
    const now = new Date();
    const iso = now.toISOString();
    const timeStr = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    const pDate = toPersianDate(iso.slice(0, 10));
    const formattedLastBackup = `${pDate} ${timeStr}`;

    setLastBackupDate(formattedLastBackup);
    window.localStorage.setItem(LAST_BACKUP_KEY, formattedLastBackup);

    // Add to snapshot history
    createSnapshot(accounts, records);

    const exportPayload = {
      app: "Portfolio Performance Tracker",
      version: "1.0",
      exportedAt: iso,
      jalaliExportedAt: formattedLastBackup,
      accounts,
      records,
      cashInterests,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = `portfolio_backup_${iso.slice(0, 10)}.json`;

    return { blob, filename };
  }

  // Import JSON payload
  function importBackupData(imported: { accounts?: Account[]; records?: PortfolioRecord[] }) {
    const newAccounts = Array.isArray(imported.accounts) ? imported.accounts : [];
    const newRecords = Array.isArray(imported.records) ? imported.records : [];

    // First save current state as a snapshot before replacing
    if (accounts.length > 0 || records.length > 0) {
      createSnapshot(accounts, records);
    }

    setAccounts(newAccounts);
    setRecords(newRecords);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    const pDate = toPersianDate(now.toISOString().slice(0, 10));
    const formattedDate = `${pDate} ${timeStr}`;

    setLastBackupDate(formattedDate);
    window.localStorage.setItem(LAST_BACKUP_KEY, formattedDate);
  }

  function restoreSnapshot(id: string) {
    const target = backupHistory.find((s) => s.id === id);
    if (!target) return;

    createSnapshot(accounts, records);
    setAccounts(target.data.accounts);
    setRecords(target.data.records);
  }

  function deleteSnapshot(id: string) {
    setBackupHistory((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <DataContext.Provider
      value={{
        accounts,
        records,
        currencyUnit,
        cashInterests,
        dueCashInterests,
        loaded,
        lastBackupDate,
        backupHistory,
        setCurrencyUnit,
        addAccount,
        deleteAccount,
        addRecord,
        deleteRecord,
        addCashInterest,
        deleteCashInterest,
        settleCashInterest,
        exportBackupData,
        importBackupData,
        restoreSnapshot,
        deleteSnapshot,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
