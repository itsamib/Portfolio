'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { toPersianDate, getPersianWeekNumber, getPersianQuarter, getPersianMonthName } from '@/lib/persianDate';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'sixMonths' | 'yearly';

interface ProfitRecord {
  date: string;
  account_id: string;
  daily_profit: number;
  cumulative_profit: number;
}

interface Props {
  records: ProfitRecord[];
  accountId?: string;
}

export const ProfitTimePeriods: React.FC<Props> = ({ records, accountId }) => {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'daily', label: t('period.daily', language) },
    { key: 'weekly', label: t('period.weekly', language) },
    { key: 'monthly', label: t('period.monthly', language) },
    { key: 'quarterly', label: t('period.quarterly', language) },
    { key: 'sixMonths', label: t('period.sixMonths', language) },
    { key: 'yearly', label: t('period.yearly', language) },
  ];

  const filteredRecords = useMemo(() => {
    return records.filter(r => !accountId || r.account_id === accountId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, accountId]);

  const groupedData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    const grouped: Record<string, { total: number; count: number; date: string }> = {};

    filteredRecords.forEach(record => {
      const date = new Date(record.date);
      let groupKey: string;
      let displayLabel: string;

      switch (selectedPeriod) {
        case 'daily':
          groupKey = record.date;
          displayLabel = language === 'fa' 
            ? toPersianDate(record.date)
            : record.date;
          break;

        case 'weekly': {
          const year = date.getFullYear();
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
          groupKey = `${year}-W${weekNum}`;
          displayLabel = language === 'fa'
            ? `هفته ${getPersianWeekNumber(date)}`
            : `Week ${weekNum}`;
          break;
        }

        case 'monthly': {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          groupKey = `${year}-${month}`;
          displayLabel = language === 'fa'
            ? `${getPersianMonthName(month)} ${year + 622}`
            : `${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
          break;
        }

        case 'quarterly': {
          const year = date.getFullYear();
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          groupKey = `${year}-Q${quarter}`;
          displayLabel = language === 'fa'
            ? `سه ماهه ${getPersianQuarter(date)} سال ${year + 622}`
            : `Q${quarter} ${year}`;
          break;
        }

        case 'sixMonths': {
          const year = date.getFullYear();
          const half = date.getMonth() < 6 ? 1 : 2;
          groupKey = `${year}-H${half}`;
          displayLabel = language === 'fa'
            ? `${half === 1 ? 'نیمه اول' : 'نیمه دوم'} سال ${year + 622}`
            : `H${half} ${year}`;
          break;
        }

        case 'yearly':
          groupKey = String(date.getFullYear());
          displayLabel = language === 'fa'
            ? `سال ${date.getFullYear() + 622}`
            : String(date.getFullYear());
          break;

        default:
          groupKey = record.date;
          displayLabel = record.date;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { total: 0, count: 0, date: displayLabel };
      }

      grouped[groupKey].total += record.daily_profit;
      grouped[groupKey].count += 1;
    });

    return Object.values(grouped).map(item => ({
      name: item.date,
      profit: Math.round(item.total * 100) / 100,
      count: item.count,
    }));
  }, [filteredRecords, selectedPeriod, language]);

  if (filteredRecords.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">{t('msg.noProfitData', language)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      {/* Period Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('msg.selectPeriod', language)}
        </label>
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
          {periods.map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                selectedPeriod === period.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => `${value.toFixed(2)}`}
              labelStyle={{ color: '#fff' }}
            />
            <Bar 
              dataKey="profit" 
              fill="#3b82f6" 
              name={t('metric.dailyProfit', language)}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('metric.profitChange', language)}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {groupedData.length > 0 ? groupedData[groupedData.length - 1]?.profit.toFixed(2) : '0.00'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('metric.cumulativeProfit', language)}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {groupedData.reduce((sum, item) => sum + item.profit, 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('metric.profitChange', language)} ({selectedPeriod})</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {groupedData.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitTimePeriods;