import type { HistoryPoint } from '../types/stats';
import type { PlayerActivity, PlayerFull, PlayerSummary } from '../types/player';
import { mossApi } from './client';

type StatMap = Record<string, Record<string, number> | undefined>;

type ApiPlayer = {
  uuid: string;
  name?: string;
  online?: boolean;
  activity?: ApiPlayerActivity;
  stats?: StatMap | { stats?: StatMap };
};

type ApiPlayerActivity = {
  first_seen_iso?: string | null;
  last_seen_iso?: string | null;
  last_join_iso?: string | null;
  last_quit_iso?: string | null;
  last_session_millis?: number;
  active_now_millis?: number;
  playtime_ticks?: number;
  total_recorded_delta_ticks?: number;
};

type ApiPlaytimePoint = {
  timestamp?: number;
  timestamp_iso?: string;
  playtime_ticks?: number;
  delta_ticks?: number;
};

type PlayersResponse = {
  players?: ApiPlayer[];
};

function unwrapStats(player: ApiPlayer): StatMap {
  const stats = player.stats;
  if (!stats) return {};
  if (Object.prototype.hasOwnProperty.call(stats, 'stats')) {
    return (stats as { stats?: StatMap }).stats ?? {};
  }
  return stats as StatMap;
}

function sum(values?: Record<string, number>) {
  return Object.values(values ?? {}).reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function topEntries(values?: Record<string, number>, limit = 6) {
  return Object.entries(values ?? {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }));
}

function stat(custom: Record<string, number>, key: string) {
  return custom[`minecraft:${key}`] ?? 0;
}

function cmToMeters(value: number) {
  return Math.round(value / 100);
}

function distanceMeters(custom: Record<string, number> = {}) {
  return Math.round(
    Object.entries(custom).reduce((total, [key, value]) => (key.endsWith('_one_cm') ? total + value : total), 0) / 100,
  );
}

function playTimeHours(custom: Record<string, number> = {}) {
  return Math.round(((custom['minecraft:play_time'] ?? custom['minecraft:play_one_minute'] ?? 0) / 20 / 3600) * 10) / 10;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function ticksToHours(value = 0) {
  return Math.round((value / 20 / 3600) * 10) / 10;
}

function millisToHours(value = 0) {
  return Math.round((value / 3_600_000) * 10) / 10;
}

function isoOrEmpty(value?: string | null) {
  return value ?? '';
}

function normalizeActivity(activity?: ApiPlayerActivity): PlayerActivity | undefined {
  if (!activity) return undefined;
  return {
    first_seen: isoOrEmpty(activity.first_seen_iso),
    last_seen: isoOrEmpty(activity.last_seen_iso),
    last_join: isoOrEmpty(activity.last_join_iso),
    last_quit: isoOrEmpty(activity.last_quit_iso),
    last_session_hours: millisToHours(activity.last_session_millis),
    active_now_hours: millisToHours(activity.active_now_millis),
    playtime_hours: ticksToHours(activity.playtime_ticks),
    total_recorded_delta_hours: ticksToHours(activity.total_recorded_delta_ticks),
  };
}

function normalizeTimestamp(point: ApiPlaytimePoint) {
  if (point.timestamp_iso) return point.timestamp_iso;
  if (!isFiniteNumber(point.timestamp)) return '';
  const millis = point.timestamp < 1_000_000_000_000 ? point.timestamp * 1000 : point.timestamp;
  return new Date(millis).toISOString();
}

function normalizePlaytimeSeries(points: ApiPlaytimePoint[]): HistoryPoint[] {
  let deltaTicksTotal = 0;
  return points
    .map((point) => ({ ...point, timestamp_iso: normalizeTimestamp(point) }))
    .filter((point) => point.timestamp_iso)
    .sort((a, b) => new Date(a.timestamp_iso).getTime() - new Date(b.timestamp_iso).getTime())
    .map((point) => {
      if (isFiniteNumber(point.delta_ticks)) deltaTicksTotal += point.delta_ticks;
      return {
        timestamp: point.timestamp_iso,
        count: ticksToHours(isFiniteNumber(point.playtime_ticks) ? point.playtime_ticks : deltaTicksTotal),
      };
    });
}

function appendCurrentPlaytimePoint(history: HistoryPoint[], player: PlayerFull): HistoryPoint[] {
  const currentHours = player.activity?.playtime_hours || player.play_time_hours;
  if (!currentHours) return history;

  const timestamp = player.activity?.last_seen || new Date().toISOString();
  const last = history.at(-1);
  if (!last) return [{ timestamp, count: currentHours }];

  const lastTime = new Date(last.timestamp).getTime();
  const currentTime = new Date(timestamp).getTime();
  if (currentTime > lastTime || currentHours > last.count) {
    return [...history, { timestamp, count: currentHours }];
  }

  return history;
}

function rankFor(player: PlayerSummary): PlayerSummary['rank'] {
  if (player.online) return 'vip';
  if (player.play_time_hours > 250) return 'vip';
  return 'member';
}

function normalizeSummary(player: ApiPlayer): PlayerSummary {
  const stats = unwrapStats(player);
  const custom = stats['minecraft:custom'] ?? {};
  const deaths = stat(custom, 'deaths');
  const mobKills = stat(custom, 'mob_kills');
  const playerKills = stat(custom, 'player_kills');
  const kills = mobKills + playerKills;

  const activity = normalizeActivity(player.activity);
  const play_time_hours = activity?.playtime_hours || playTimeHours(custom);

  const summary: PlayerSummary = {
    uuid: player.uuid,
    username: player.name ?? player.uuid.slice(0, 8),
    last_seen: player.activity?.last_seen_iso ?? new Date().toISOString(),
    online: Boolean(player.online),
    activity,
    play_time_hours,
    rank: 'member',
    deaths,
    kills,
    mob_kills: mobKills,
    player_kills: playerKills,
    blocks_mined: sum(stats['minecraft:mined']),
    distance_meters: distanceMeters(custom),
    jumps: stat(custom, 'jump'),
  };

  summary.rank = rankFor(summary);
  return summary;
}

function normalizeFull(player: ApiPlayer): PlayerFull {
  const summary = normalizeSummary(player);
  const stats = unwrapStats(player);
  const custom = stats['minecraft:custom'] ?? {};
  const pickedUp = sum(stats['minecraft:picked_up']);
  const dropped = sum(stats['minecraft:dropped']);

  return {
    ...summary,
    first_joined: '',
    blocks_placed: sum(stats['minecraft:used']),
    blocks_broken: summary.blocks_mined,
    blocks_crafted: sum(stats['minecraft:crafted']),
    deaths: summary.deaths,
    kills: summary.kills,
    mob_kills: summary.mob_kills,
    player_kills: summary.player_kills,
    damage_dealt: stat(custom, 'damage_dealt'),
    damage_taken: stat(custom, 'damage_taken'),
    damage_blocked_by_shield: stat(custom, 'damage_blocked_by_shield'),
    jumps: summary.jumps,
    leave_game: stat(custom, 'leave_game'),
    sleep_in_bed: stat(custom, 'sleep_in_bed'),
    sneak_time_hours: Math.round((stat(custom, 'sneak_time') / 20 / 3600) * 10) / 10,
    sprint_meters: cmToMeters(stat(custom, 'sprint_one_cm')),
    walk_meters: cmToMeters(stat(custom, 'walk_one_cm') + stat(custom, 'walk_on_water_one_cm')),
    swim_meters: cmToMeters(stat(custom, 'swim_one_cm')),
    fly_meters: cmToMeters(stat(custom, 'fly_one_cm')),
    climb_meters: cmToMeters(stat(custom, 'climb_one_cm')),
    fall_meters: cmToMeters(stat(custom, 'fall_one_cm')),
    boat_meters: cmToMeters(stat(custom, 'boat_one_cm')),
    minecart_meters: cmToMeters(stat(custom, 'minecart_one_cm')),
    horse_meters: cmToMeters(stat(custom, 'horse_one_cm')),
    items_picked_up: pickedUp,
    items_dropped: dropped,
    items_used: sum(stats['minecraft:used']),
    items_broken: sum(stats['minecraft:broken']),
    items_crafted_total: sum(stats['minecraft:crafted']),
    animals_bred: stat(custom, 'animals_bred'),
    fish_caught: stat(custom, 'fish_caught'),
    talked_to_villager: stat(custom, 'talked_to_villager'),
    traded_with_villager: stat(custom, 'traded_with_villager'),
    interacted_with_crafting_table: stat(custom, 'interact_with_crafting_table'),
    open_chest: stat(custom, 'open_chest'),
    items_traded: pickedUp + dropped,
    balance: 0,
    achievements: [
      `${summary.blocks_mined.toLocaleString('ru-RU')} блоков добыто`,
      `${summary.kills.toLocaleString('ru-RU')} убийств`,
      `${Math.round(summary.distance_meters).toLocaleString('ru-RU')} м пройдено`,
      `${summary.jumps.toLocaleString('ru-RU')} прыжков`,
    ],
    top_mined: topEntries(stats['minecraft:mined']),
    top_used: topEntries(stats['minecraft:used']),
    top_crafted: topEntries(stats['minecraft:crafted']),
    top_picked_up: topEntries(stats['minecraft:picked_up']),
    top_dropped: topEntries(stats['minecraft:dropped']),
    top_killed: topEntries(stats['minecraft:killed']),
    top_killed_by: topEntries(stats['minecraft:killed_by']),
    stats_history: [],
  };
}

export async function fetchPlayers(signal?: AbortSignal): Promise<PlayerSummary[]> {
  const payload = await mossApi<PlayersResponse>('players?stats=true', signal);
  return (payload.players ?? []).map(normalizeSummary).sort((a, b) => Number(b.online) - Number(a.online));
}

export async function fetchPlayer(uuid: string, signal?: AbortSignal): Promise<PlayerFull> {
  const [player, playtime] = await Promise.all([
    mossApi<ApiPlayer>(`players/${uuid}`, signal),
    mossApi<ApiPlaytimePoint[]>(`activity/${uuid}/playtime?limit=200`, signal).catch(() => []),
  ]);
  const normalized = normalizeFull(player);
  normalized.stats_history = appendCurrentPlaytimePoint(normalizePlaytimeSeries(playtime), normalized);
  return normalized;
}
