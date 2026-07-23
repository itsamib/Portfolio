'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import DataTable from '@/components/DataTable';
import DailyProfitBarChart from '@/components/charts/DailyProfitBarChart';
import EquityLineChart from '@/components/charts/EquityLineChart';
import { calculateMetrics, fetchRecords } from '@/lib/api';
import { PortfolioRecord, SummaryRecord, EnrichedRecord } from '@/lib/types';

export default function Dashboard() {
  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [summary, setSummary] = useState<SummaryRecord[]>([]);
  const [enrichedData, setEnrichedData] = useState<EnrichedRecord[]>([]);
  const [totals, setTotals] = useState({
    total_equity: 0,
    total_profit: 0,
    overall_roi: null as number | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedRecords = await fetchRecords();
      setRecords(fetchedRecords);

      const metrics = await calculateMetrics(fetchedRecords);
      setEnrichedData(metrics.enriched_data);
      setSummary(metrics.summary);
      setTotals({
        total_equity: metrics.total_equity,
        total_profit: metrics.total_profit,
        overall_roi: metrics.overall_roi,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for charts
  const dailyProfitChartData = enrichedData.reduce((acc: any, record: any) => {
    const existing = acc.find((item: any) => item.date === record.Date);
    if (existing) {
      existing[record.Account_ID] = record.Daily_Profit;
    } else {
      acc.push({
        date: record.Date,
        [record.Account_ID]: record.Daily_Profit,
      });
    }
    return acc;
  }, []);

  const equityChartData = enrichedData.reduce((acc: any, record: any) => {
    const existing = acc.find((item: any) => item.date === record.Date);
    if (existing) {
      existing[record.Account_ID] = record.Total_Equity;
    } else {
      acc.push({
        date: record.Date,
        [record.Account_ID]: record.Total_Equity,
      });
    }
    return acc;
  }, []);

  const accounts = Array.from(
    new Set(enrichedData.map((r) => r.Account_ID))
  ) as string[];

  const getRoiTrend = (roi: number | null) => {
    if (roi === null) return 'neutral';
    if (roi > 0.05) return 'up';
    if (roi < -0.05) return 'down';
    return 'neutral';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Master Dashboard</h1>
        <p className="text-gray-400">Overall portfolio performance across all accounts</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Equity"
          value={`$${totals.total_equity.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Net Profit"
          value={`$${totals.total_profit.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={totals.total_profit > 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Overall ROI"
          value={
            totals.overall_roi !== null
              ? `${(totals.overall_roi * 100).toFixed(2)}%`
              : 'N/A'
          }
          icon={<Target className="w-5 h-5" />}
          trend={getRoiTrend(totals.overall_roi)}
        />
      </div>

      {/* Summary Table */}
      {summary.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Account Summary</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-3 text-left font-semibold text-gray-300">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">
                      Total Equity
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">
                      Cumulative Profit
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((account, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-gray-100">
                        {account.Account_ID}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-300">
                        ${account.Total_Equity.toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-medium ${
                          account.Cumulative_Profit > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        ${account.Cumulative_Profit.toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-medium ${
                          account.ROI > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(account.ROI * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {dailyProfitChartData.length > 0 && (
          <DailyProfitBarChart data={dailyProfitChartData} accounts={accounts} />
        )}
        {equityChartData.length > 0 && (
          <EquityLineChart data={equityChartData} accounts={accounts} />
        )}
      </div>

      {/* Recent Records */}
      {records.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Records</h2>
          <DataTable data={records.slice(-10)} />
        </div>
      )}

      {records.length === 0 && !isLoading && (
        <div className="glass p-12 rounded-2xl text-center">
          <p className="text-gray-400 mb-4">No data yet. Start by adding portfolio records.</p>
          <a
            href="/data-entry"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Add First Record
          </a>
        </div>
      )}
    </div>
  );
}
