"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Account, PortfolioRecord } from "@/lib/types";

const ACCOUNTS_KEY = "ppt_accounts";
const RECORDS_KEY = "ppt_records";

interface DataContextValue {
  accounts: Account[];
  records: PortfolioRecord[];
  loaded: boolean;
  addAccount: (name: string) => void;
  deleteAccount: (id: string) => void;
  addRecord: (record: Omit<PortfolioRecord, "id">) => void;
  deleteRecord: (id: string) => void;
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
    setAccounts(storedAccounts);
    setRecords(storedRecords);
    setLoaded(true);
  }, []);

  // Persist accounts whenever they change
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, loaded]);

  // Persist records whenever they change
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records, loaded]);

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
  }

  function addRecord(record: Omit<PortfolioRecord, "id">) {
    const newRecord: PortfolioRecord = { id: uuidv4(), ...record };
    setRecords((prev) => [...prev, newRecord]);
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <DataContext.Provider
      value={{
        accounts,
        records,
        loaded,
        addAccount,
        deleteAccount,
        addRecord,
        deleteRecord,
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
