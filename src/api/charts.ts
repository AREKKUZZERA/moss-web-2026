import type { ActivityLeader, GlobalStatLeader, HeatmapPoint, HistoryPoint, ServerHealth, ServerTotals, StatsOverview } from '../types/stats';
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
  players_total?: number;
  players_online?: number;
  totals?: {
    total_jumps?: number;
    total_deaths?: number;
    total_playtime_ticks?: number;
    total_player_kills?: number;
    total_mob_kills?: number;
    total_damage_dealt?: number;
    blocks_mined?: number;
    items_crafted?: number;
  };
};

type ActivityHeatmapResponse = {
  daily_playtime_ticks?: Record<string, number>;
  heatmap_ticks?: Record<string, number>;
};

type ActivityTopResponse = Array<{
  rank?: number;
  uuid?: string;
  name?: string;
  delta_ticks?: number;
  active_now_millis?: number;
  last_seen_iso?: string | null;
}>;

function dateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function ticksToHours(value = 0) {
  return Math.round((value / 20 / 3600) * 10) / 10;
}

function millisToHours(value = 0) {
  return Math.round((value / 3_600_000) * 10) / 10;
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

function buildDailyTicksHeatmap(dailyTicks: Record<string, number> = {}): HeatmapPoint[] {
  const keys = Object.keys(dailyTicks).sort();
  const lastDate = keys.at(-1) ? new Date(keys.at(-1) as string) : new Date();
  const firstDate = new Date(lastDate);
  firstDate.setUTCDate(firstDate.getUTCDate() - 364);

  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(firstDate);
    date.setUTCDate(firstDate.getUTCDate() + index);
    const key = dateKey(date);
    return {
      date: key,
      item_delta: ticksToHours(dailyTicks[key] ?? 0),
    };
  });
}

function calculateWeeklyItemGrowth(history: HistoryPoint[]) {
  const lastPoint = history.at(-1);
  if (!lastPoint) return 0;

  const weekAgo = new Date(lastPoint.timestamp);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const previousPoint = [...history]
    .reverse()
    .find((point) => new Date(point.timestamp).getTime() <= weekAgo.getTime());

  return Math.max(0, lastPoint.count - (previousPoint?.count ?? lastPoint.count));
}

function periodLength(period: '7d' | '30d' | '90d' | 'all') {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return Infinity;
}

function normalizeServerTotals(summary: SummaryResponse): ServerTotals {
  const totals = summary.totals ?? {};
  return {
    players_total: summary.players_total ?? 0,
    players_online: summary.players_online ?? 0,
    total_jumps: totals.total_jumps ?? 0,
    total_deaths: totals.total_deaths ?? 0,
    total_playtime_hours: ticksToHours(totals.total_playtime_ticks),
    total_player_kills: totals.total_player_kills ?? 0,
    total_mob_kills: totals.total_mob_kills ?? 0,
    total_damage_dealt: totals.total_damage_dealt ?? 0,
    blocks_mined: totals.blocks_mined ?? 0,
    items_crafted: totals.items_crafted ?? 0,
  };
}

function normalizeActivityTop(entries: ActivityTopResponse): ActivityLeader[] {
  return entries.map((entry, index) => ({
    rank: entry.rank ?? index + 1,
    uuid: entry.uuid ?? String(index),
    name: entry.name ?? 'Unknown',
    delta_hours: ticksToHours(entry.delta_ticks),
    active_now_hours: millisToHours(entry.active_now_millis),
    last_seen: entry.last_seen_iso ?? '',
  }));
}

async function fetchActivityTop(window: 'day' | 'week', signal?: AbortSignal) {
  const payload = await mossApi<ActivityTopResponse>(`activity/top?window=${window}&limit=10`, signal);
  return normalizeActivityTop(payload);
}

async function fetchGlobalLeader(path: string, signal?: AbortSignal) {
  const joiner = path.includes('?') ? '&' : '?';
  return mossApi<GlobalStatLeader[]>(`${path}${joiner}limit=10`, signal).catch(() => []);
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
  const [items, summary, history, activityHeatmap, activityTopDay, activityTopWeek, health, playtimeLeaders, deathLeaders, killLeaders, jumpLeaders] = await Promise.all([
    fetchItems(signal),
    mossApi<SummaryResponse>('summary', signal),
    fetchItemHistory('minecraft:all', 'all', signal),
    mossApi<ActivityHeatmapResponse>('activity/heatmap', signal).catch(() => ({ daily_playtime_ticks: {} })),
    fetchActivityTop('day', signal).catch(() => []),
    fetchActivityTop('week', signal).catch(() => []),
    mossApi<ServerHealth>('health', signal).catch(() => null),
    fetchGlobalLeader('top/minecraft:play_time?section=minecraft:custom', signal),
    fetchGlobalLeader('top/minecraft:deaths?section=minecraft:custom', signal),
    fetchGlobalLeader('top/minecraft:player_kills?section=minecraft:custom', signal),
    fetchGlobalLeader('top/minecraft:jump?section=minecraft:custom', signal),
  ]);

  const sorted = [...items].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const serverTotals = normalizeServerTotals(summary);

  return {
    total_items: items.reduce((sum, item) => sum + item.count, 0),
    total_unique_items: items.length,
    top_growing: sorted.filter((item) => item.delta > 0).slice(0, 10),
    top_falling: sorted.filter((item) => item.delta < 0).slice(0, 10),
    most_common: [...items].sort((a, b) => b.count - a.count).slice(0, 10),
    activity_heatmap: buildActivityHeatmap(history),
    playtime_heatmap: buildDailyTicksHeatmap(activityHeatmap.daily_playtime_ticks),
    turnover_week: calculateWeeklyItemGrowth(history),
    online_now: serverTotals.players_online,
    daily_peak: serverTotals.players_online,
    server_totals: serverTotals,
    activity_top_day: activityTopDay,
    activity_top_week: activityTopWeek,
    global_leaders: {
      playtime: playtimeLeaders,
      deaths: deathLeaders,
      player_kills: killLeaders,
      jumps: jumpLeaders,
    },
    health,
  };
}
