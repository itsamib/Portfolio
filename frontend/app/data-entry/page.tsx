'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import {
  fetchAccounts,
  fetchRecords,
  addRecord,
  deleteRecord,
} from '@/lib/api';
import { PortfolioRecord } from '@/lib/types';

export default function DataEntry() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account_id: '',
    portfolio_value: '',
    cash_balance: '',
    net_cash_flow: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedAccounts, fetchedRecords] = await Promise.all([
        fetchAccounts(),
        fetchRecords(),
      ]);
      setAccounts(fetchedAccounts);
      setRecords(fetchedRecords);
      if (fetchedAccounts.length > 0 && !formData.account_id) {
        setFormData((prev) => ({
          ...prev,
          account_id: fetchedAccounts[0],
        }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const newRecord: PortfolioRecord = {
        date: formData.date,
        account_id: formData.account_id,
        portfolio_value: parseFloat(formData.portfolio_value),
        cash_balance: parseFloat(formData.cash_balance),
        net_cash_flow: parseFloat(formData.net_cash_flow),
      };

      await addRecord(newRecord);
      setMessage({ type: 'success', text: 'Record added successfully!' });
      setRecords((prev) => [...prev, newRecord]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        account_id: formData.account_id,
        portfolio_value: '',
        cash_balance: '',
        net_cash_flow: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add record. Please try again.' });
      console.error('Error adding record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteRecord(index);
      setRecords((prev) => prev.filter((_, i) => i !== index));
      setMessage({ type: 'success', text: 'Record deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete record.' });
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Data Entry</h1>
        <p className="text-gray-400">Add new portfolio snapshots manually</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/50 text-green-400'
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Add New Record</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account</label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>

          {/* Portfolio Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Portfolio Value ($)
            </label>
            <input
              type="number"
              name="portfolio_value"
              step="0.01"
              value={formData.portfolio_value}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0.00"
            />
          </div>

          {/* Cash Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cash Balance ($)
            </label>
            <input
              type="number"
              name="cash_balance"
              step="0.01"
              value={formData.cash_balance}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0.00"
            />
          </div>

          {/* Net Cash Flow */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Net Cash Flow ($)
            </label>
            <input
              type="number"
              name="net_cash_flow"
              step="0.01"
              value={formData.net_cash_flow}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </form>

      {/* Records Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Records</h2>
        <DataTable data={records} onDelete={handleDelete} />
      </div>
    </div>
  );
}
