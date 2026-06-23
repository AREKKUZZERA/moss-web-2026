import type { HistoryPoint, StatsOverview } from '../types/stats';
import { fetchItems } from './items';
import { mossApi, tableApi } from './client';

type ChartPoint = {
  date?: string;
  time?: string;
  timestamp?: string;
  value?: number;
  count?: number;
};

type SummaryResponse = {
  players_online?: number;
  totals?: {
    items_crafted?: number;
    blocks_mined?: number;
  };
};

function dateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildActivityHeatmap(history: HistoryPoint[]) {
  const points = history.filter((point) => point.timestamp);
  const lastPoint = points.at(-1);
  const lastDate = lastPoint ? new Date(lastPoint.timestamp) : new Date();
  const firstDate = new Date(lastDate);
  firstDate.setUTCDate(firstDate.getUTCDate() - 364);

  const countByDate = new Map(points.map((point) => [dateKey(point.timestamp), point.count]));
  const previousPoint = [...points].reverse().find((point) => new Date(point.timestamp).getTime() < firstDate.getTime());
  let previousCount = previousPoint?.count ?? 0;
  let hasPreviousCount = Boolean(previousPoint);

  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(firstDate);
    date.setUTCDate(firstDate.getUTCDate() + index);

    const key = dateKey(date);
    const count = countByDate.get(key);
    const item_delta = count === undefined || !hasPreviousCount ? 0 : Math.max(0, count - previousCount);
    if (count !== undefined) {
      previousCount = count;
      hasPreviousCount = true;
    }

    return { date: key, item_delta };
  });
}

function periodLength(period: '7d' | '30d' | '90d' | 'all') {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return Infinity;
}

export async function fetchItemHistory(
  _itemId = 'minecraft:diamond',
  period: '7d' | '30d' | '90d' | 'all' = '30d',
  signal?: AbortSignal,
): Promise<HistoryPoint[]> {
  const payload = await tableApi<ChartPoint[]>('getMossChartData', signal);
  return payload
    .map((point) => ({
      timestamp: point.timestamp ?? point.time ?? point.date ?? '',
      count: point.count ?? point.value ?? 0,
    }))
    .filter((point) => point.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-periodLength(period));
}

export async function fetchStatsOverview(signal?: AbortSignal): Promise<StatsOverview> {
  const [items, summary, history] = await Promise.all([
    fetchItems(signal),
    mossApi<SummaryResponse>('summary', signal),
    fetchItemHistory('minecraft:all', 'all', signal),
  ]);

  const sorted = [...items].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    total_items: items.reduce((sum, item) => sum + item.count, 0),
    total_unique_items: items.length,
    top_growing: sorted.filter((item) => item.delta > 0).slice(0, 10),
    top_falling: sorted.filter((item) => item.delta < 0).slice(0, 10),
    most_common: [...items].sort((a, b) => b.count - a.count).slice(0, 10),
    activity_heatmap: buildActivityHeatmap(history),
    turnover_week: summary.totals?.items_crafted ?? summary.totals?.blocks_mined ?? 0,
    online_now: summary.players_online ?? 0,
    daily_peak: summary.players_online ?? 0,
  };
}
