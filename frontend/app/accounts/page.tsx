'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  fetchAccounts,
  createAccount,
  deleteAccount,
} from '@/lib/api';

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const fetchedAccounts = await fetchAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await createAccount(newAccountName);
      setAccounts((prev) => [...prev, newAccountName].sort());
      setNewAccountName('');
      setMessage({ type: 'success', text: 'Account created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create account.' });
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountName: string) => {
    if (!confirm(`Are you sure you want to delete ${accountName}? This will also delete all its records.`)) {
      return;
    }

    try {
      await deleteAccount(accountName);
      setAccounts((prev) => prev.filter((acc) => acc !== accountName));
      setMessage({ type: 'success', text: 'Account deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account.' });
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Account Management</h1>
        <p className="text-gray-400">Create and manage your trading accounts</p>
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

      {/* Create Account Form */}
      <form onSubmit={handleCreateAccount} className="glass p-8 rounded-2xl space-y-4">
        <h2 className="text-2xl font-semibold mb-6">Create New Account</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Account name (e.g., Trading Account 1)"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !newAccountName.trim()}
            className="px-8 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </div>
      </form>

      {/* Accounts List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Accounts</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account} className="glass p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{account}</h3>
                  <p className="text-sm text-gray-500 mt-1">Trading Account</p>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete account"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-gray-400 mb-4">No accounts yet. Create your first account above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
