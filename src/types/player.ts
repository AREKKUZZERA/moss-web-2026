import type { HistoryPoint } from './stats';
import type { ItemEntry } from './item';

export type PlayerSummary = {
  uuid: string;
  username: string;
  last_seen: string;
  online: boolean;
  play_time_hours: number;
  rank: 'admin' | 'vip' | 'member';
  deaths: number;
  kills: number;
  blocks_mined: number;
  distance_meters: number;
};

export type PlayerFull = PlayerSummary & {
  first_joined: string;
  blocks_placed: number;
  blocks_broken: number;
  blocks_crafted: number;
  deaths: number;
  kills: number;
  mob_kills: number;
  player_kills: number;
  damage_dealt: number;
  damage_taken: number;
  jumps: number;
  items_picked_up: number;
  items_dropped: number;
  items_traded: number;
  balance: number;
  achievements: string[];
  top_mined: Array<{ id: string; count: number }>;
  top_used: Array<{ id: string; count: number }>;
  top_picked_up: Array<{ id: string; count: number }>;
  top_killed: Array<{ id: string; count: number }>;
  top_killed_by: Array<{ id: string; count: number }>;
  inventory_snapshot?: ItemEntry[];
  stats_history: HistoryPoint[];
};
