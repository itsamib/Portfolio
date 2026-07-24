export type Language = 'en' | 'fa';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'Portfolio Tracker',
    'header.language': 'Language',
    'header.theme': 'Theme',
    'header.darkMode': 'Dark Mode',
    'header.lightMode': 'Light Mode',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.dataEntry': 'Data Entry',
    'nav.accounts': 'Accounts',
    'app.footerNote': 'Data stored locally in your browser.',
    
    // Time Periods
    'period.daily': 'Daily',
    'period.weekly': 'Weekly',
    'period.monthly': 'Monthly',
    'period.quarterly': '3 Months',
    'period.sixMonths': '6 Months',
    'period.yearly': 'Yearly',
    
    // Metrics
    'metric.latestEquity': 'Latest Equity',
    'metric.totalEquity': 'Total Equity',
    'metric.dailyProfit': 'Daily Profit',
    'metric.cumulativeProfit': 'Cumulative Profit',
    'metric.totalNetFlow': 'Total Net Flow',
    'metric.roi': 'ROI',
    'metric.profitChange': 'Profit Change',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview across all accounts.',
    'dashboard.noData': 'No data yet. Add accounts and records from the Data Entry page to see your dashboard come alive.',
    'dashboard.profitByPeriod': 'Profit Analysis by Timeframe',
    'dashboard.accountSummary': 'Account Performance',

    // Accounts
    'accounts.title': 'Accounts',
    'accounts.subtitle': 'Create and manage the accounts you track performance for.',
    'accounts.createAccount': 'Create Account',
    'accounts.placeholder': 'e.g. Brokerage, Roth IRA, Crypto Wallet',
    'accounts.noAccounts': 'No accounts yet. Create your first account above.',
    'accounts.records': 'records',
    'accounts.record': 'record',
    'accounts.viewDashboard': 'View dashboard',
    'accounts.enterName': 'Enter an account name.',
    'accounts.exists': 'An account with that name already exists.',
    'accounts.confirmDelete': 'Delete account and its records?',
    
    // Account Dashboard
    'account.backToAccounts': 'Back to accounts',
    'account.logged': 'records logged.',
    'account.notFound': 'Account not found. It may have been deleted.',
    'account.noRecords': 'No records for this account yet. Add some from the Data Entry page.',
    
    // Data Entry
    'dataEntry.title': 'Data Entry',
    'dataEntry.subtitle': 'Log daily portfolio value, cash balance, and net cash flow per account.',
    'dataEntry.noAccountNotice': 'You need at least one account before adding records. Create one on the Accounts page.',
    'dataEntry.date': 'Date',
    'dataEntry.account': 'Account',
    'dataEntry.portfolioValue': 'Portfolio Value',
    'dataEntry.cashBalance': 'Cash Balance',
    'dataEntry.netCashFlow': 'Net Cash Flow',
    'dataEntry.addRecord': 'Add Record',
    'dataEntry.selectAccount': 'Select Account',
    'dataEntry.validationError': 'Portfolio value, cash balance, and net cash flow must be numbers.',
    'dataEntry.selectAccountError': 'Select an account.',
    
    // Table
    'table.date': 'Date',
    'table.jalaliDate': 'Jalali Date',
    'table.account': 'Account',
    'table.portfolioValue': 'Portfolio Value',
    'table.cashBalance': 'Cash Balance',
    'table.netCashFlow': 'Net Cash Flow',
    'table.equity': 'Latest Equity',
    'table.profit': 'Cumulative Profit',
    'table.roi': 'ROI',
    'table.noRecords': 'No records logged yet.',
    
    // Chart
    'chart.equity': 'Equity Over Time',
    'chart.dailyProfit': 'Daily Profit',
    'chart.cumulativeProfit': 'Cumulative Profit',

    // Onboarding Splash
    'splash.title': 'My Portfolio Tracker',
    'splash.subtitle': 'Smart investment & equity performance management',
    'splash.desc': 'Track equity, cash flows, daily profits, and ROI across all your accounts with dual Jalali & Gregorian calendars.',
    'splash.start': 'Get Started',
    'splash.skip': 'Skip',
    'splash.feature1Title': 'Multi-Timeframe Analysis',
    'splash.feature1Desc': 'View profits aggregated by daily, weekly, monthly, quarterly, and yearly periods.',
    'splash.feature2Title': 'Persian Jalali & Gregorian Support',
    'splash.feature2Desc': 'Full support for Jalali dates alongside standard Gregorian dates.',
    'splash.feature3Title': 'Complete Data Privacy',
    'splash.feature3Desc': 'Your data stays safe locally in your browser with easy JSON backup & restore.',

    // Backup & Restore
    'backup.title': 'Backup & Restore',
    'backup.subtitle': 'Export your portfolio data to JSON or restore from a previous backup file.',
    'backup.export': 'Export Backup (JSON)',
    'backup.import': 'Import Backup File',
    'backup.lastBackup': 'Last Backup Date:',
    'backup.never': 'No backups exported yet',
    'backup.confirmTitle': 'Confirm Data Restore',
    'backup.confirmMessage': 'Restoring this file will replace your current accounts and records. Do you wish to continue?',
    'backup.history': 'Local Snapshots History',
    'backup.noHistory': 'No snapshots recorded yet.',
    'backup.restore': 'Restore',
    'backup.delete': 'Delete',
    'backup.successImport': 'Portfolio data imported successfully!',
    'backup.successSnapshot': 'Snapshot restored successfully!',
    'backup.errorInvalidJson': 'Invalid JSON format or unsupported portfolio data schema.',
    'backup.errorSize': 'File size exceeds the 10MB limit.',
    'backup.recordCount': 'Accounts & Records',

    // PWA
    'pwa.install': 'Install App',
    'pwa.installed': 'Installed',
    'pwa.tooltip': 'Install on home screen for offline access',

    // Menu & Drawer
    'menu.title': 'Menu',
    'menu.backup': 'Backup & Restore',
    'menu.onboarding': 'App Guide & Overview',
    'menu.installPwa': 'Install App on Phone',
    'menu.about': 'About App',
    'menu.language': 'Language',
    'about.version': 'Version 1.0.0 - Mobile PWA Ready',
    'about.desc': 'Advanced portfolio tracker for managing equity, profits, and ROI with 100% private local storage.',

    // Currency Units & Controls
    'currency.unit': 'Currency Unit',
    'currency.toman': 'Toman',
    'currency.rial': 'Rial',
    'currency.millionToman': 'Million Toman',
    'currency.usd': 'USD ($)',

    // Cash Interest & Maturity
    'interest.title': 'Cash Deposit Interest & Monthly Maturity',
    'interest.subtitle': 'Set interest rate for daily calculation based on cash balance and monthly payout',
    'interest.add': 'Save Cash Interest Rate',
    'interest.rate': 'Interest Rate',
    'interest.period': 'Interest Period',
    'interest.yearly': 'Yearly',
    'interest.monthly': 'Monthly',
    'interest.maturityDay': 'Monthly Maturity Day',
    'interest.lastSettlement': 'Start / Last Payout Date',
    'interest.calcAmount': 'Accrued Interest to Date',
    'interest.yieldCardTitle': 'Cash Yield & Investment Status',
    'interest.daysRemaining': 'Days Until Maturity',
    'interest.accruedSoFar': 'Accrued Daily Interest',
    'interest.monthlyForecast': 'Forecasted Monthly Yield',
    'interest.currentCash': 'Current Cash Balance',
    'interest.popupTitle': '🔔 Monthly Cash Interest Maturity Due!',
    'interest.popupDesc': 'Your cash deposit monthly maturity has arrived. Confirm to deposit accrued interest to cash balance.',
    'interest.depositAction': 'Deposit & Increase Cash',
    'interest.skipAction': 'Skip This Cycle',
    'interest.autoNotice': 'Daily interest accrues based on daily changes in your account cash balance.',

    // Common Navigation
    'common.back': 'Go Back',

    // Messages
    'msg.loading': 'Loading...',
    'msg.error': 'Error',
    'msg.success': 'Success',
    'msg.selectPeriod': 'Select Period',
    'msg.noProfitData': 'No profit data available for this period',
  },
  fa: {
    // Header
    'header.title': 'مدیریت سرمایه‌گذاری',
    'header.language': 'زبان',
    'header.theme': 'حالت نمایش',
    'header.darkMode': 'شب (تاریک)',
    'header.lightMode': 'روز (روشن)',
    
    // Navigation
    'nav.dashboard': 'داشبورد',
    'nav.dataEntry': 'ورود اطلاعات',
    'nav.accounts': 'حساب‌ها',
    'app.footerNote': 'اطلاعات به‌صورت محلی در مرورگر ذخیره می‌شود.',
    
    // Time Periods
    'period.daily': 'روزانه',
    'period.weekly': 'هفتگی',
    'period.monthly': 'ماهانه',
    'period.quarterly': '۳ ماهه',
    'period.sixMonths': '۶ ماهه',
    'period.yearly': 'سالانه',
    
    // Metrics
    'metric.latestEquity': 'ارزش کل دارایی',
    'metric.totalEquity': 'کل سرمایه',
    'metric.dailyProfit': 'سود روزانه',
    'metric.cumulativeProfit': 'سود انباشته کل',
    'metric.totalNetFlow': 'خالص واریز / برداشت',
    'metric.roi': 'بازده سرمایه‌گذاری (ROI)',
    'metric.profitChange': 'تغییرات سود',
    
    // Dashboard
    'dashboard.title': 'داشبورد مدیریت سرمایه',
    'dashboard.subtitle': 'نمای کلی عملکرد کلیه حساب‌های سرمایه‌گذاری.',
    'dashboard.noData': 'هنوز داده‌ای ثبت نشده است. از بخش ورود اطلاعات، حساب‌ها و مقادیر را ثبت کنید تا نمودارها فعال شوند.',
    'dashboard.profitByPeriod': 'تحلیل سود در بازه‌های زمانی',
    'dashboard.accountSummary': 'خلاصه عملکرد حساب‌ها',

    // Accounts
    'accounts.title': 'حساب‌ها',
    'accounts.subtitle': 'ایجاد و مدیریت حساب‌هایی که عملکرد آن‌ها را ثبت می‌کنید.',
    'accounts.createAccount': 'ایجاد حساب جدید',
    'accounts.placeholder': 'مانند: بورس، حساب بانکی، صندوق، ولت رمزارز',
    'accounts.noAccounts': 'هنوز حسابی ایجاد نشده است. اولین حساب خود را در بالا ایجاد کنید.',
    'accounts.records': 'رکورد',
    'accounts.record': 'رکورد',
    'accounts.viewDashboard': 'مشاهده داشبورد',
    'accounts.enterName': 'نام حساب را وارد کنید.',
    'accounts.exists': 'حسابی با این نام قبلاً ثبت شده است.',
    'accounts.confirmDelete': 'آیا از حذف این حساب و رکوردهای آن مطمئن هستید؟',
    
    // Account Dashboard
    'account.backToAccounts': 'بازگشت به حساب‌ها',
    'account.logged': 'رکورد ثبت شده.',
    'account.notFound': 'حساب یافت نشد. ممکن است حذف شده باشد.',
    'account.noRecords': 'هیچ رکوردی برای این حساب ثبت نشده است. از صفحه ورود اطلاعات اضافه کنید.',
    
    // Data Entry
    'dataEntry.title': 'ورود اطلاعات',
    'dataEntry.subtitle': 'ثبت روزانه ارزش پورتفولیو، موجودی نقد و جریان نقدی خالص هر حساب.',
    'dataEntry.noAccountNotice': 'برای افزودن رکورد ابتدا باید حداقل یک حساب ایجاد کنید. از صفحه حساب‌ها حساب جدید بسازید.',
    'dataEntry.date': 'تاریخ میلادی',
    'dataEntry.account': 'حساب سرمایه‌گذاری',
    'dataEntry.portfolioValue': 'ارزش پورتفولیو (دارایی غیرنقد)',
    'dataEntry.cashBalance': 'موجودی نقد',
    'dataEntry.netCashFlow': 'جریان نقدی خالص (واریز - برداشت)',
    'dataEntry.addRecord': 'ثبت رکورد',
    'dataEntry.selectAccount': 'انتخاب حساب',
    'dataEntry.validationError': 'ارزش پورتفولیو، موجودی نقد و جریان نقدی باید عدد باشند.',
    'dataEntry.selectAccountError': 'لطفاً یک حساب انتخاب کنید.',
    
    // Table
    'table.date': 'تاریخ میلادی',
    'table.jalaliDate': 'تاریخ شمسی',
    'table.account': 'حساب',
    'table.portfolioValue': 'ارزش پورتفولیو',
    'table.cashBalance': 'موجودی نقد',
    'table.netCashFlow': 'جریان نقدی',
    'table.equity': 'کل دارایی',
    'table.profit': 'سود انباشته',
    'table.roi': 'بازده (ROI)',
    'table.noRecords': 'هنوز رکوردی ثبت نشده است.',
    
    // Chart
    'chart.equity': 'روند کل دارایی',
    'chart.dailyProfit': 'سود روزانه',
    'chart.cumulativeProfit': 'سود انباشته کل',

    // Onboarding Splash
    'splash.title': 'پورتفولیو من',
    'splash.subtitle': 'مدیریت هوشمند پورتفولیو و تحلیل سرمایه‌گذاری',
    'splash.desc': 'عملکرد حساب‌های سرمایه‌گذاری، جریان نقدی و بازدهی (ROI) خود را با تقویم شمسی و میلادی مدیریت کنید.',
    'splash.start': 'ورود به برنامه / شروع',
    'splash.skip': 'رد کردن',
    'splash.feature1Title': 'تحلیل سود در ۶ بازه زمانی',
    'splash.feature1Desc': 'بررسی سود انباشته به‌صورت روزانه، هفتگی، ماهانه، ۳ ماهه، ۶ ماهه و سالانه.',
    'splash.feature2Title': 'پشتیبانی کامل از تاریخ شمسی',
    'splash.feature2Desc': 'ثبت داده‌ها با تقویم شمسی و تبدیل خودکار به میلادی با دقت بالا.',
    'splash.feature3Title': 'حفظ حریم خصوصی و بکاپ هوشمند',
    'splash.feature3Desc': 'ذخیره‌سازی کامل محلی در مرورگر به همراه خروجی گرفتن JSON و بازیابی سریع.',

    // Backup & Restore
    'backup.title': 'پشتیبان‌گیری و بازیابی اطلاعات',
    'backup.subtitle': 'خروجی گرفتن از تمام حساب‌ها و رکوردهای مالی به فایل JSON یا بازیابی بکاپ‌های قبلی.',
    'backup.export': 'دریافت فایل پشتیبان (Export)',
    'backup.import': 'ورود فایل پشتیبان (Import)',
    'backup.lastBackup': 'تاریخ آخرین پشتیبان‌گیری:',
    'backup.never': 'هنوز خروجی گرفته نشده است',
    'backup.confirmTitle': 'تأیید بازنویسی اطلاعات',
    'backup.confirmMessage': 'آیا مطمئن هستید؟ با بازیابی این فایل، تمامی حساب‌ها و داده‌های فعلی با اطلاعات جدید جایگزین خواهد شد.',
    'backup.history': 'تاریخچه پشتیبان‌های ذخیره‌شده local',
    'backup.noHistory': 'هنوز هیچ نسخه پشتیبانی ذخیره نشده است.',
    'backup.restore': 'بازیابی',
    'backup.delete': 'حذف',
    'backup.successImport': 'اطلاعات پورتفولیو با موفقیت بازیابی شد.',
    'backup.successSnapshot': 'نسخه پشتیبان با موفقیت بازگردانی شد.',
    'backup.errorInvalidJson': 'فایل انتخاب‌شده معتبر نیست یا ساختار JSON آن نادرست است.',
    'backup.errorSize': 'حجم فایل بیشتر از حد مجاز (۱۰ مگابایت) است.',
    'backup.recordCount': 'حساب و رکورد',

    // PWA
    'pwa.install': 'نصب اپلیکیشن',
    'pwa.installed': 'برنامه نصب شده است',
    'pwa.tooltip': 'نصب بر روی صفحه اصلی گوشی یا کامپیوتر',

    // Menu & Drawer
    'menu.title': 'منوی اصلی',
    'menu.backup': 'پشتیبان‌گیری و بازیابی اطلاعات',
    'menu.onboarding': 'راهنما و معرفی ویژگی‌ها',
    'menu.installPwa': 'نصب اپلیکیشن روی گوشی (PWA)',
    'menu.about': 'درباره پورتفولیو من',
    'menu.language': 'تغییر زبان (Language)',
    'about.version': 'نسخه ۱.۰.۰ - آماده نصب مستقل',
    'about.desc': 'نرم‌افزار مدیریت هوشمند پورتفولیو، تحلیل سود و بازده سرمایه‌گذاری با ذخیره‌سازی محلی کاملاً امن در مرورگر.',

    // Currency Units & Controls
    'currency.unit': 'واحد پول',
    'currency.toman': 'تومان',
    'currency.rial': 'ریال',
    'currency.millionToman': 'میلیون تومان',
    'currency.usd': 'دلار ($)',

    // Cash Interest & Maturity
    'interest.title': 'تنظیم سود سپرده و واریز ماهانه وجه نقد',
    'interest.subtitle': 'تعیین درصد سود برای محاسبه روزانه سود بر اساس موجودی نقد و واریز خودکار در سررسید تکرار شونده',
    'interest.add': 'ثبت نرخ سود وجه نقد',
    'interest.rate': 'درصد سود',
    'interest.period': 'دوره سود',
    'interest.yearly': 'سالانه',
    'interest.monthly': 'ماهانه',
    'interest.maturityDay': 'روز سررسید در هر ماه',
    'interest.lastSettlement': 'مبدا شروع / آخرین واریز',
    'interest.calcAmount': 'سود تعلق‌گرفته تا امروز',
    'interest.yieldCardTitle': 'وضعیت سرمایه‌گذاری و پیش‌بینی سود نقد',
    'interest.daysRemaining': 'روز مانده تا سررسید',
    'interest.accruedSoFar': 'سود روزانه انباشته (تا امروز)',
    'interest.monthlyForecast': 'پیش‌بینی سود ماهانه با موجودی فعلی',
    'interest.currentCash': 'موجودی نقد فعلی',
    'interest.popupTitle': '🔔 موعد سررسید دریافت سود وجه نقد فرا رسیده است!',
    'interest.popupDesc': 'موعد سررسید ماهانه سود وجه نقد فرا رسیده است. با تأیید واریز، سود روزانه انباشته‌شده به موجودی نقد اضافه می‌شود.',
    'interest.depositAction': 'واریز و افزایش موجودی نقد',
    'interest.skipAction': 'انصراف / رد کردن این دوره',
    'interest.autoNotice': 'سود روزانه بر اساس تغییرات روزانه موجودی نقد حساب شما محاسبه می‌شود.',

    // Common Navigation
    'common.back': 'بازگشت به صفحه قبل',

    // Messages
    'msg.loading': 'در حال بارگذاری...',
    'msg.error': 'خطا',
    'msg.success': 'با موفقیت انجام شد',
    'msg.selectPeriod': 'انتخاب بازه زمانی سود',
    'msg.noProfitData': 'داده‌ای برای تحلیل سود در این بازه زمانی وجود ندارد.',
  },
};

import { CurrencyUnit } from './types';

export const t = (key: string, lang: Language): string => {
  return translations[lang]?.[key] || key;
};

export function formatCurrency(
  value: number,
  lang: Language = 'en',
  unit: CurrencyUnit = 'toman'
) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';

  const isNeg = value < 0;
  const absVal = Math.abs(value);

  if (unit === 'usd') {
    if (lang === 'fa') {
      const formatted = absVal.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
      return isNeg ? `-${formatted} $` : `${formatted} $`;
    }
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  }

  if (unit === 'rial') {
    const rialVal = absVal;
    if (lang === 'fa') {
      const formatted = rialVal.toLocaleString('fa-IR', { maximumFractionDigits: 0 });
      return isNeg ? `-${formatted} ریال` : `${formatted} ریال`;
    }
    return isNeg ? `-${rialVal.toLocaleString('en-US')} Rial` : `${rialVal.toLocaleString('en-US')} Rial`;
  }

  if (unit === 'million_toman') {
    const millionVal = absVal / 1000000;
    if (lang === 'fa') {
      const formatted = millionVal.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
      return isNeg ? `-${formatted} میلیون تومان` : `${formatted} میلیون تومان`;
    }
    return isNeg
      ? `-${millionVal.toLocaleString('en-US', { maximumFractionDigits: 2 })} M Toman`
      : `${millionVal.toLocaleString('en-US', { maximumFractionDigits: 2 })} M Toman`;
  }

  // Default: Toman (تومان)
  if (lang === 'fa') {
    const formatted = absVal.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
    return isNeg ? `-${formatted} تومان` : `${formatted} تومان`;
  }
  return isNeg ? `-${absVal.toLocaleString('en-US')} Toman` : `${absVal.toLocaleString('en-US')} Toman`;
}

export function formatPercent(value: number | null, lang: Language = 'en') {
  if (value === null || Number.isNaN(value)) return '—';
  const pct = (value * 100).toFixed(1);
  if (lang === 'fa') {
    const formattedPct = Number(pct).toLocaleString('fa-IR');
    return `%${formattedPct}`;
  }
  return `${pct}%`;
}
