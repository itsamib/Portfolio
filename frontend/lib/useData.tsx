'use client';

import { useEffect, useState, useContext, createContext, ReactNode } from 'react';
import { PortfolioRecord, Account } from '@/lib/types';

interface DataContextType {
  records: PortfolioRecord[];
  accounts: Account[];
  addRecord: (record: PortfolioRecord) => void;
  deleteRecord: (index: number) => void;
  addAccount: (account: Account) => void;
  deleteAccount: (index: number) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('portfolio_records');
    const savedAccounts = localStorage.getItem('portfolio_accounts');
    
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever records or accounts change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('portfolio_records', JSON.stringify(records));
    }
  }, [records, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('portfolio_accounts', JSON.stringify(accounts));
    }
  }, [accounts, isLoading]);

  const addRecord = (record: PortfolioRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  const deleteRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...prev, account]);
  };

  const deleteAccount = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DataContext.Provider
      value={{
        records,
        accounts,
        addRecord,
        deleteRecord,
        addAccount,
        deleteAccount,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
