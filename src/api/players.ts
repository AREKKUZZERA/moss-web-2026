import type { PlayerFull, PlayerSummary } from '../types/player';
import { mossApi } from './client';

type StatMap = Record<string, Record<string, number> | undefined>;

type ApiPlayer = {
  uuid: string;
  name?: string;
  online?: boolean;
  stats?: StatMap | { stats?: StatMap };
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

function topEntries(values?: Record<string, number>, limit = 5) {
  return Object.entries(values ?? {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }));
}

function distanceMeters(custom: Record<string, number> = {}) {
  return Math.round(
    Object.entries(custom).reduce((total, [key, value]) => (key.endsWith('_one_cm') ? total + value : total), 0) / 100,
  );
}

function playTimeHours(custom: Record<string, number> = {}) {
  return Math.round(((custom['minecraft:play_time'] ?? custom['minecraft:play_one_minute'] ?? 0) / 20 / 3600) * 10) / 10;
}

function rankFor(player: PlayerSummary): PlayerSummary['rank'] {
  if (player.online) return 'vip';
  if (player.play_time_hours > 250) return 'vip';
  return 'member';
}

function normalizeSummary(player: ApiPlayer): PlayerSummary {
  const stats = unwrapStats(player);
  const custom = stats['minecraft:custom'] ?? {};
  const deaths = custom['minecraft:deaths'] ?? 0;
  const kills = (custom['minecraft:mob_kills'] ?? 0) + (custom['minecraft:player_kills'] ?? 0);

  const summary: PlayerSummary = {
    uuid: player.uuid,
    username: player.name ?? player.uuid.slice(0, 8),
    last_seen: new Date().toISOString(),
    online: Boolean(player.online),
    play_time_hours: playTimeHours(custom),
    rank: 'member',
    deaths,
    kills,
    blocks_mined: sum(stats['minecraft:mined']),
    distance_meters: distanceMeters(custom),
  };

  summary.rank = rankFor(summary);
  return summary;
}

function normalizeFull(player: ApiPlayer): PlayerFull {
  const summary = normalizeSummary(player);
  const stats = unwrapStats(player);
  const custom = stats['minecraft:custom'] ?? {};
  const mobKills = custom['minecraft:mob_kills'] ?? 0;
  const playerKills = custom['minecraft:player_kills'] ?? 0;
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
    mob_kills: mobKills,
    player_kills: playerKills,
    damage_dealt: custom['minecraft:damage_dealt'] ?? 0,
    damage_taken: custom['minecraft:damage_taken'] ?? 0,
    jumps: custom['minecraft:jump'] ?? 0,
    items_picked_up: pickedUp,
    items_dropped: dropped,
    items_traded: pickedUp + dropped,
    balance: 0,
    achievements: [
      `${summary.blocks_mined.toLocaleString('ru-RU')} блоков добыто`,
      `${summary.kills.toLocaleString('ru-RU')} убийств`,
      `${Math.round(summary.distance_meters).toLocaleString('ru-RU')} м пройдено`,
    ],
    top_mined: topEntries(stats['minecraft:mined']),
    top_used: topEntries(stats['minecraft:used']),
    top_picked_up: topEntries(stats['minecraft:picked_up']),
    top_killed: topEntries(stats['minecraft:killed']),
    top_killed_by: topEntries(stats['minecraft:killed_by']),
    stats_history: [
      {
        timestamp: new Date().toISOString(),
        count: summary.play_time_hours,
      },
    ],
  };
}

export async function fetchPlayers(signal?: AbortSignal): Promise<PlayerSummary[]> {
  const payload = await mossApi<PlayersResponse>('players?stats=true', signal);
  return (payload.players ?? []).map(normalizeSummary).sort((a, b) => Number(b.online) - Number(a.online));
}

export async function fetchPlayer(uuid: string, signal?: AbortSignal): Promise<PlayerFull> {
  return normalizeFull(await mossApi<ApiPlayer>(`players/${uuid}`, signal));
}
