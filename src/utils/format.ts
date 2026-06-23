const number = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 2 });
const plainNumber = new Intl.NumberFormat('ru-RU');
const date = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' });

export function formatNumber(value: number, compact = true) {
  return compact ? number.format(value) : plainNumber.format(value);
}

export function formatSigned(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return '0';
}

export function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return date.format(parsed);
}

export function formatRelative(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}

export function formatDuration(hours: number) {
  return `${plainNumber.format(Math.round(hours))}ч`;
}
