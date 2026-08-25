export interface DayInfo {
  dateString: string; // YYYY-MM-DD
  dayName: string; // 'Monday', 'Tuesday'
  dayShort: string; // 'Mon', 'Tue'
  monthDay: string; // 'Aug 24'
  isToday: boolean;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekStart(referenceDate: Date): Date {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  // We make Monday index 0
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeekDates(weekStart: Date): DayInfo[] {
  const days: DayInfo[] = [];
  const todayStr = formatDateToISO(new Date());

  for (let i = 0; i < 7; i++) {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + i);
    const dateString = formatDateToISO(current);

    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
    const dayShort = current.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    days.push({
      dateString,
      dayName,
      dayShort,
      monthDay,
      isToday: dateString === todayStr,
    });
  }

  return days;
}

export function getWeekRangeDisplay(weekStart: Date): string {
  const days = getWeekDates(weekStart);
  const start = days[0].monthDay;
  const end = days[6].monthDay;
  const year = weekStart.getFullYear();
  return `${start} – ${end}, ${year}`;
}
