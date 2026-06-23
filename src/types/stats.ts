import type { ItemEntry } from './item';

export type HistoryPoint = {
  timestamp: string;
  count: number;
};

export type HeatmapPoint = {
  date: string;
  item_delta: number;
};

export type StatsOverview = {
  total_items: number;
  total_unique_items: number;
  top_growing: ItemEntry[];
  top_falling: ItemEntry[];
  most_common: ItemEntry[];
  activity_heatmap: HeatmapPoint[];
  turnover_week: number;
  online_now: number;
  daily_peak: number;
};
