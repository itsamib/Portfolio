'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import DailyProfitBarChart from '@/components/charts/DailyProfitBarChart';
import EquityLineChart from '@/components/charts/EquityLineChart';
import CumulativeProfitAreaChart from '@/components/charts/CumulativeProfitAreaChart';
import { calculateMetrics, fetchRecords } from '@/lib/api';
import { PortfolioRecord, EnrichedRecord } from '@/lib/types';

export default function AccountDashboard() {
  const params = useParams();
  const accountId = decodeURIComponent(params.id as string);

  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [filteredData, setFilteredData] = useState<EnrichedRecord[]>([]);
  const [metrics, setMetrics] = useState({
    total_equity: 0,
    cumulative_profit: 0,
    total_net_flow: 0,
    roi: 0,
    latest_date: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [accountId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedRecords = await fetchRecords();
      setRecords(fetchedRecords);

      const calculated = await calculateMetrics(fetchedRecords);
      const accountData = calculated.enriched_data.filter(
        (record) => record.Account_ID === accountId
      );
      setFilteredData(accountData);

      if (accountData.length > 0) {
        const latest = accountData[accountData.length - 1];
        const totalFlow = accountData.reduce((sum, r) => sum + r.Total_Net_Cash_Flow, 0) / accountData.length;
        setMetrics({
          total_equity: latest.Total_Equity,
          cumulative_profit: latest.Cumulative_Profit,
          total_net_flow: totalFlow,
          roi: totalFlow !== 0 ? latest.Cumulative_Profit / totalFlow : 0,
          latest_date: latest.Date,
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for charts
  const dailyProfitData = filteredData.map((record: any) => ({
    date: record.Date,
    [accountId]: record.Daily_Profit,
  }));

  const equityData = filteredData.map((record: any) => ({
    date: record.Date,
    [accountId]: record.Total_Equity,
  }));

  const cumulativeProfitData = filteredData.map((record: any) => ({
    date: record.Date,
    [accountId]: record.Cumulative_Profit,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{accountId}</h1>
        <p className="text-gray-400">Individual account performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Equity"
          value={`$${metrics.total_equity.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Cumulative Profit"
          value={`$${metrics.cumulative_profit.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={metrics.cumulative_profit > 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Total Net Flow"
          value={`$${metrics.total_net_flow.toFixed(2)}`}
        />
        <MetricCard
          title="ROI"
          value={`${(metrics.roi * 100).toFixed(2)}%`}
          icon={<Target className="w-5 h-5" />}
          trend={metrics.roi > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      {filteredData.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EquityLineChart data={equityData} accounts={[accountId]} />
            <DailyProfitBarChart data={dailyProfitData} accounts={[accountId]} />
          </div>
          <CumulativeProfitAreaChart data={cumulativeProfitData} accounts={[accountId]} />
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl text-center">
          <p className="text-gray-400">No data available for this account yet.</p>
        </div>
      )}
    </div>
  );
}
