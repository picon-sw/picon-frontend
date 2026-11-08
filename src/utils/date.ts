// 날짜는 API로 주고받기 쉽게 'YYYY-MM-DD' 문자열(로컬 날짜 기준)로 다룸

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// 말일 넘침 방지 (1월 31일 + 1개월 → 2월 말일)
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function weekdayLabel(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export const WEEKDAY_LABELS = WEEKDAYS;

// 예: 11월 15일 (토)
export function formatMonthDay(key: string): string {
  const date = fromDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdayLabel(date)})`;
}
