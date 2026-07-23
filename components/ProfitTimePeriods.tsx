'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t, formatCurrency } from '@/lib/i18n';
import { toPersianDate, getPersianMonthName } from '@/lib/persianDate';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CalendarRange, TrendingUp, DollarSign, Layers } from 'lucide-react';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'sixMonths' | 'yearly';

interface ProfitRecord {
  date: string;
  account_id: string;
  daily_profit: number;
  cumulative_profit?: number;
}

interface Props {
  records: ProfitRecord[];
  accountId?: string;
  title?: string;
}

import { useData } from '@/context/DataContext';

export const ProfitTimePeriods: React.FC<Props> = ({ records, accountId, title }) => {
  const { language } = useLanguage();
  const { currencyUnit } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  const isRtl = language === 'fa';

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'daily', label: t('period.daily', language) },
    { key: 'weekly', label: t('period.weekly', language) },
    { key: 'monthly', label: t('period.monthly', language) },
    { key: 'quarterly', label: t('period.quarterly', language) },
    { key: 'sixMonths', label: t('period.sixMonths', language) },
    { key: 'yearly', label: t('period.yearly', language) },
  ];

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => !accountId || r.account_id === accountId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records, accountId]);

  const groupedData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    const grouped: Record<string, { total: number; count: number; label: string; orderKey: string }> = {};

    filteredRecords.forEach((record) => {
      const cleanDate = record.date.slice(0, 10);
      const [gy, gm, gd] = cleanDate.split('-').map(Number);
      const dateObj = new Date(gy, gm - 1, gd);

      let groupKey = '';
      let displayLabel = '';
      let orderKey = cleanDate;

      if (language === 'fa') {
        const pDateStr = toPersianDate(dateObj);
        const [jy, jm, jd] = pDateStr.split('/').map(Number);

        switch (selectedPeriod) {
          case 'daily':
            groupKey = pDateStr;
            displayLabel = `${jd} ${getPersianMonthName(jm)}`;
            orderKey = `${jy}${String(jm).padStart(2, '0')}${String(jd).padStart(2, '0')}`;
            break;

          case 'weekly': {
            const dayOfYear = jm <= 6 ? (jm - 1) * 31 + jd : 186 + (jm - 7) * 30 + jd;
            const weekNum = Math.ceil(dayOfYear / 7);
            groupKey = `${jy}-W${weekNum}`;
            displayLabel = `هفته ${weekNum} (${jy})`;
            orderKey = `${jy}W${String(weekNum).padStart(2, '0')}`;
            break;
          }

          case 'monthly': {
            groupKey = `${jy}-${jm}`;
            displayLabel = `${getPersianMonthName(jm)} ${jy}`;
            orderKey = `${jy}${String(jm).padStart(2, '0')}`;
            break;
          }

          case 'quarterly': {
            const jq = jm <= 3 ? 1 : jm <= 6 ? 2 : jm <= 9 ? 3 : 4;
            groupKey = `${jy}-Q${jq}`;
            displayLabel = `۳ ماهه ${jq} (${jy})`;
            orderKey = `${jy}Q${jq}`;
            break;
          }

          case 'sixMonths': {
            const jh = jm <= 6 ? 1 : 2;
            groupKey = `${jy}-H${jh}`;
            displayLabel = `${jh === 1 ? '۶ ماهه اول' : '۶ ماهه دوم'} (${jy})`;
            orderKey = `${jy}H${jh}`;
            break;
          }

          case 'yearly': {
            groupKey = `${jy}`;
            displayLabel = `سال ${jy}`;
            orderKey = `${jy}`;
            break;
          }
        }
      } else {
        // English
        switch (selectedPeriod) {
          case 'daily':
            groupKey = cleanDate;
            displayLabel = cleanDate;
            orderKey = cleanDate;
            break;

          case 'weekly': {
            const weekNum = Math.ceil((gd + new Date(gy, gm - 1, 1).getDay()) / 7);
            groupKey = `${gy}-W${weekNum}`;
            displayLabel = `Week ${weekNum} (${gy})`;
            orderKey = `${gy}W${String(weekNum).padStart(2, '0')}`;
            break;
          }

          case 'monthly': {
            groupKey = `${gy}-${gm}`;
            displayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            orderKey = `${gy}${String(gm).padStart(2, '0')}`;
            break;
          }

          case 'quarterly': {
            const q = Math.ceil(gm / 3);
            groupKey = `${gy}-Q${q}`;
            displayLabel = `Q${q} ${gy}`;
            orderKey = `${gy}Q${q}`;
            break;
          }

          case 'sixMonths': {
            const h = gm <= 6 ? 1 : 2;
            groupKey = `${gy}-H${h}`;
            displayLabel = `H${h} ${gy}`;
            orderKey = `${gy}H${h}`;
            break;
          }

          case 'yearly': {
            groupKey = `${gy}`;
            displayLabel = `${gy}`;
            orderKey = `${gy}`;
            break;
          }
        }
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { total: 0, count: 0, label: displayLabel, orderKey };
      }

      grouped[groupKey].total += record.daily_profit;
      grouped[groupKey].count += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => a.orderKey.localeCompare(b.orderKey))
      .map((item) => ({
        name: item.label,
        profit: Math.round(item.total * 100) / 100,
        count: item.count,
      }));
  }, [filteredRecords, selectedPeriod, language]);

  const totalProfitInPeriod = useMemo(() => {
    return groupedData.reduce((sum, item) => sum + item.profit, 0);
  }, [groupedData]);

  const latestProfitInPeriod = useMemo(() => {
    if (groupedData.length === 0) return 0;
    return groupedData[groupedData.length - 1].profit;
  }, [groupedData]);

  if (filteredRecords.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
        {t('msg.noProfitData', language)}
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-gray-100 text-base">
            {title || t('dashboard.profitByPeriod', language)}
          </h3>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === period.key
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `${val >= 0 ? '' : '-'}$${Math.abs(val)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
              formatter={(value: any) => [formatCurrency(Number(value), language, currencyUnit), t('metric.dailyProfit', language)]}
              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
              {groupedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {t('metric.profitChange', language)} ({periods.find((p) => p.key === selectedPeriod)?.label})
            </p>
            <p className={`text-base font-bold tabular-nums mt-0.5 ${latestProfitInPeriod >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(latestProfitInPeriod, language, currencyUnit)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {t('metric.cumulativeProfit', language)}
            </p>
            <p className={`text-base font-bold tabular-nums mt-0.5 ${totalProfitInPeriod >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(totalProfitInPeriod, language, currencyUnit)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {isRtl ? 'تعداد بازه‌های ثبت شده' : 'Logged Periods'}
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-gray-100 tabular-nums mt-0.5">
              {groupedData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitTimePeriods;
