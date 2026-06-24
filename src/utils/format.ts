const compactNumber = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const plainNumber = new Intl.NumberFormat('ru-RU');
const date = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' });

const compactUnits = [
  { value: 1_000_000_000_000, suffix: 'T' },
  { value: 1_000_000_000, suffix: 'B' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000, suffix: 'K' },
] as const;

function formatCompactNumber(value: number) {
  const abs = Math.abs(value);
  const unitIndex = compactUnits.findIndex((unit) => abs >= unit.value);

  if (unitIndex === -1) return plainNumber.format(value);

  const unit = compactUnits[unitIndex];
  const scaled = value / unit.value;
  const rounded = Number(scaled.toFixed(2));
  const nextUnit = compactUnits[unitIndex - 1];

  if (nextUnit && Math.abs(rounded) >= 1000) {
    return `${compactNumber.format(value / nextUnit.value)} ${nextUnit.suffix}`;
  }

  return `${compactNumber.format(rounded)} ${unit.suffix}`;
}

export function formatNumber(value: number, compact = true) {
  return compact ? formatCompactNumber(value) : plainNumber.format(value);
}

export function formatNumberWithUnit(value: number, unit: string, compact = true) {
  const formatted = formatNumber(value, compact);

  return formatted.includes(' ') ? `${formatted} ${unit}` : `${formatted}${unit}`;
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
