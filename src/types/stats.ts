import type { ItemEntry } from './item';

export type HistoryPoint = {
  timestamp: string;
  count: number;
};

export type HeatmapPoint = {
  date: string;
  item_delta: number;
};

export type ServerTotals = {
  players_total: number;
  players_online: number;
  total_jumps: number;
  total_deaths: number;
  total_playtime_hours: number;
  total_player_kills: number;
  total_mob_kills: number;
  total_damage_dealt: number;
  blocks_mined: number;
  items_crafted: number;
};

export type ActivityLeader = {
  rank: number;
  uuid: string;
  name: string;
  delta_hours: number;
  active_now_hours: number;
  last_seen: string;
};

export type GlobalStatLeader = {
  rank: number;
  uuid: string;
  name: string;
  online: boolean;
  value: number;
  stat_key: string;
  section?: string;
};

export type ServerHealth = {
  status: string;
  players_cached: number;
  players_online: number;
  rate_limit: boolean;
  rate_limit_rps?: number;
};

export type StatsOverview = {
  total_items: number;
  total_unique_items: number;
  top_growing: ItemEntry[];
  top_falling: ItemEntry[];
  most_common: ItemEntry[];
  activity_heatmap: HeatmapPoint[];
  playtime_heatmap: HeatmapPoint[];
  turnover_week: number;
  online_now: number;
  daily_peak: number;
  server_totals: ServerTotals;
  activity_top_day: ActivityLeader[];
  activity_top_week: ActivityLeader[];
  global_leaders: {
    playtime: GlobalStatLeader[];
    deaths: GlobalStatLeader[];
    player_kills: GlobalStatLeader[];
    jumps: GlobalStatLeader[];
  };
  health: ServerHealth | null;
};
