import axios from 'axios';
import { PortfolioRecord, CalculateResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all accounts
 */
export async function fetchAccounts(): Promise<string[]> {
  try {
    const response = await api.get('/api/accounts');
    return response.data.accounts || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}

/**
 * Fetch all records
 */
export async function fetchRecords(): Promise<PortfolioRecord[]> {
  try {
    const response = await api.get('/api/records');
    return response.data.records || [];
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
}

/**
 * Add a new record
 */
export async function addRecord(record: PortfolioRecord): Promise<{ id: number; message: string }> {
  try {
    const response = await api.post('/api/records', record);
    return response.data;
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
}

/**
 * Delete a record by ID
 */
export async function deleteRecord(recordId: number): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/api/records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

/**
 * Calculate metrics for given records
 */
export async function calculateMetrics(records: PortfolioRecord[]): Promise<CalculateResponse> {
  try {
    const response = await api.post('/api/calculate', records);
    return response.data;
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return {
      enriched_data: [],
      summary: [],
      total_equity: 0,
      total_profit: 0,
      overall_roi: null,
    };
  }
}

/**
 * Create a new account
 */
export async function createAccount(name: string): Promise<{ account_id: string; message: string }> {
  try {
    const response = await api.post('/api/accounts', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/api/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
