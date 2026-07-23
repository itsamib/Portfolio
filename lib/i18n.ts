export type Language = 'en' | 'fa';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'Portfolio Tracker',
    'header.language': 'Language',
    'header.theme': 'Theme',
    'header.darkMode': 'Dark',
    'header.lightMode': 'Light',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.dataEntry': 'Data Entry',
    'nav.accounts': 'Accounts',
    
    // Time Periods
    'period.daily': 'Daily',
    'period.weekly': 'Weekly',
    'period.monthly': 'Monthly',
    'period.quarterly': 'Quarterly',
    'period.sixMonths': '6 Months',
    'period.yearly': 'Yearly',
    
    // Metrics
    'metric.totalEquity': 'Total Equity',
    'metric.dailyProfit': 'Daily Profit',
    'metric.cumulativeProfit': 'Cumulative Profit',
    'metric.totalNetFlow': 'Total Net Flow',
    'metric.roi': 'ROI',
    'metric.profitChange': 'Profit Change',
    
    // Account
    'account.name': 'Account Name',
    'account.addAccount': 'Add Account',
    'account.deleteAccount': 'Delete Account',
    'account.selectAccount': 'Select Account',
    'account.noAccounts': 'No accounts found',
    
    // Data Entry
    'data.date': 'Date',
    'data.portfolioValue': 'Portfolio Value',
    'data.cashBalance': 'Cash Balance',
    'data.netCashFlow': 'Net Cash Flow',
    'data.add': 'Add Record',
    'data.delete': 'Delete',
    'data.noRecords': 'No records',
    
    // Chart
    'chart.profitTrend': 'Profit Trend',
    'chart.equityTrend': 'Equity Trend',
    'chart.roiTrend': 'ROI Trend',
    
    // Messages
    'msg.loading': 'Loading...',
    'msg.error': 'Error',
    'msg.success': 'Success',
    'msg.confirmDelete': 'Are you sure?',
    'msg.selectPeriod': 'Select Period',
    'msg.noProfitData': 'No profit data available for this period',
  },
  fa: {
    // Header
    'header.title': 'ردیاب پورتفولیو',
    'header.language': 'زبان',
    'header.theme': 'تم',
    'header.darkMode': 'تاریک',
    'header.lightMode': 'روشن',
    
    // Navigation
    'nav.dashboard': 'داشبورد',
    'nav.dataEntry': 'ورود اطلاعات',
    'nav.accounts': 'حسابها',
    
    // Time Periods
    'period.daily': 'روزانه',
    'period.weekly': 'هفتگی',
    'period.monthly': 'ماهانه',
    'period.quarterly': '3 ماهه',
    'period.sixMonths': '6 ماهه',
    'period.yearly': 'سالانه',
    
    // Metrics
    'metric.totalEquity': 'کل سرمایه',
    'metric.dailyProfit': 'سود روزانه',
    'metric.cumulativeProfit': 'سود جمعی',
    'metric.totalNetFlow': 'کل جریان نقدی',
    'metric.roi': 'بازده سرمایه گذاری',
    'metric.profitChange': 'تغییر سود',
    
    // Account
    'account.name': 'نام حساب',
    'account.addAccount': 'افزودن حساب',
    'account.deleteAccount': 'حذف حساب',
    'account.selectAccount': 'انتخاب حساب',
    'account.noAccounts': 'حسابی یافت نشد',
    
    // Data Entry
    'data.date': 'تاریخ',
    'data.portfolioValue': 'ارزش پورتفولیو',
    'data.cashBalance': 'موجودی نقد',
    'data.netCashFlow': 'جریان نقدی خالص',
    'data.add': 'افزودن رکورد',
    'data.delete': 'حذف',
    'data.noRecords': 'رکوردی موجود نیست',
    
    // Chart
    'chart.profitTrend': 'روند سود',
    'chart.equityTrend': 'روند سرمایه',
    'chart.roiTrend': 'روند بازده',
    
    // Messages
    'msg.loading': 'در حال بارگذاری...',
    'msg.error': 'خطا',
    'msg.success': 'موفق',
    'msg.confirmDelete': 'آیا مطمئن هستید؟',
    'msg.selectPeriod': 'انتخاب دوره',
    'msg.noProfitData': 'داده سود برای این دوره موجود نیست',
  },
};

export const t = (key: string, lang: Language): string => {
  return translations[lang]?.[key] || key;
};
