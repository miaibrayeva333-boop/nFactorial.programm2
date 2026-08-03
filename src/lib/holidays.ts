export type CalendarHoliday = {
  date: string;
  name: string;
  region: 'Kazakhstan' | 'Europe';
};

const pad = (value: number) => String(value).padStart(2, '0');
const key = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

function shiftedDate(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return key(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = (h + l - 7 * m + 114) % 31 + 1;
  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): CalendarHoliday[] {
  const kazakhstan: CalendarHoliday[] = [
    [1, 1, 'New Year'], [1, 2, 'New Year holiday'], [1, 7, 'Orthodox Christmas'],
    [3, 8, "International Women's Day"], [3, 21, 'Nauryz'], [3, 22, 'Nauryz'],
    [3, 23, 'Nauryz'], [5, 1, "Kazakhstan People's Unity Day"],
    [5, 7, 'Defender of the Fatherland Day'], [5, 9, 'Victory Day'],
    [7, 6, 'Capital Day'], [8, 30, 'Constitution Day'], [10, 25, 'Republic Day'],
    [12, 16, 'Independence Day'],
  ].map(([month, day, name]) => ({
    date: key(year, month as number, day as number), name: name as string, region: 'Kazakhstan',
  }));

  if (year === 2026) {
    kazakhstan.push({ date: key(year, 5, 27), name: 'Qurban Ait', region: 'Kazakhstan' });
  }

  const easter = easterSunday(year);
  const europe: CalendarHoliday[] = [
    { date: shiftedDate(easter, -2), name: 'Good Friday', region: 'Europe' },
    { date: shiftedDate(easter, 0), name: 'Easter Sunday', region: 'Europe' },
    { date: shiftedDate(easter, 1), name: 'Easter Monday', region: 'Europe' },
    { date: key(year, 5, 9), name: 'Europe Day', region: 'Europe' },
    { date: key(year, 12, 25), name: 'Christmas Day', region: 'Europe' },
    { date: key(year, 12, 26), name: 'Second Day of Christmas', region: 'Europe' },
  ];

  return [...kazakhstan, ...europe];
}
