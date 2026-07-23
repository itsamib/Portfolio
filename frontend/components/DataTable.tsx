'use client';

import { Trash2 } from 'lucide-react';
import { PortfolioRecord } from '@/lib/types';

interface DataTableProps {
  data: PortfolioRecord[] | any[];
  onDelete?: (index: number) => void;
  isLoading?: boolean;
}

export default function DataTable({ data, onDelete, isLoading }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="glass p-6 rounded-2xl text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl text-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-3 text-left font-semibold text-gray-300">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-300">Account</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-300">Portfolio Value</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-300">Cash Balance</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-300">Net Cash Flow</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr
                key={idx}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-3 text-gray-300">
                  {row.date || row.Date || '-'}
                </td>
                <td className="px-6 py-3 text-gray-300">
                  {row.account_id || row.Account_ID || '-'}
                </td>
                <td className="px-6 py-3 text-right text-gray-300">
                  ${(row.portfolio_value || row.Portfolio_Value || 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-right text-gray-300">
                  ${(row.cash_balance || row.Cash_Balance || 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-right text-gray-300">
                  ${(row.net_cash_flow || row.Net_Cash_Flow || 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-center">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(idx)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
