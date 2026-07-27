const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 24 * 365],
  ['month', 60 * 24 * 30],
  ['week', 60 * 24 * 7],
  ['day', 60 * 24],
  ['hour', 60],
  ['minute', 1],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

export function formatRelativeTime(dateInput: string | Date): string {
  const target = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60_000);

  for (const [unit, minutesInUnit] of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffMinutes) >= minutesInUnit) {
      return relativeTimeFormatter.format(Math.round(diffMinutes / minutesInUnit), unit);
    }
  }
  return relativeTimeFormatter.format(0, 'minute');
}
