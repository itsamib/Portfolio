// Convert Gregorian date to Persian (Jalali) calendar
export const toPersianDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;

  let j_d_n = g_d_n - 79;
  let j_np = Math.floor(j_d_n / 12053);
  j_d_n %= 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);

  j_d_n %= 1461;

  if (j_d_n > 365) {
    jy += Math.floor((j_d_n - 1) / 365);
    j_d_n = ((j_d_n - 1) % 365);
  }

  let jm = 1;
  let jd = j_d_n + 1;

  if (jd <= 186) {
    jm = 1 + Math.floor(jd / 31);
    jd = (jd % 31) || 31;
  } else {
    jm = 7 + Math.floor((jd - 186) / 30);
    jd = ((jd - 186) % 30) || 30;
  }

  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
};

// Convert Persian date to Gregorian
export const toGregorianDate = (persianDateStr: string): Date => {
  const [jy, jm, jd] = persianDateStr.split('/').map(Number);

  const j_d_n = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 
                (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) + jd;

  const g_d_n = j_d_n + 79;

  const gy = 400 * Math.floor(g_d_n / 146097);
  let gday = g_d_n % 146097;

  let leap = true;
  if (gday >= 36525) {
    gday--;
    gy = 100 * Math.floor(gday / 36524);
    gday = gday % 36524;
    if (gday >= 365) {
      gday++;
    }
    leap = false;
  }

  const gy_add = 4 * Math.floor(gday / 1461);
  gday %= 1461;

  if (leap && gday >= 366) {
    gday--;
    gy_add += Math.floor(gday / 365);
    gday = gday % 365;
  }

  const month_len = [31, leap && gy_add % 4 === 0 && (!(gy_add % 100 === 0) || gy_add % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  let gd = gday + 1;

  for (let i = 0; i < 12; i++) {
    if (gd <= month_len[i]) {
      gm = i + 1;
      break;
    }
    gd -= month_len[i];
  }

  return new Date(gy + gy_add, gm - 1, gd);
};

// Get Persian month name
export const getPersianMonthName = (monthNumber: number): string => {
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  return months[monthNumber - 1] || '';
};

// Format Persian date with month name
export const formatPersianDate = (date: Date | string, format: 'full' | 'short' = 'full'): string => {
  const persianDate = toPersianDate(date);
  const [year, month, day] = persianDate.split('/');
  
  if (format === 'short') {
    return `${day}/${month}`;
  }
  
  const monthName = getPersianMonthName(Number(month));
  return `${day} ${monthName} ${year}`;
};

// Get week number in Persian calendar
export const getPersianWeekNumber = (date: Date): number => {
  const persianDate = toPersianDate(date);
  const [, , day] = persianDate.split('/').map(Number);
  const year = new Date(date);
  const firstDay = new Date(year.getFullYear(), 0, 1);
  const firstPersianDay = Number(toPersianDate(firstDay).split('/')[2]);
  
  return Math.ceil((day - firstPersianDay) / 7) + 1;
};

// Get Persian quarter
export const getPersianQuarter = (date: Date): number => {
  const persianDate = toPersianDate(date);
  const [, month] = persianDate.split('/').map(Number);
  
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
};