import type { ItemEntry } from '../types/item';
import { tableApi } from './client';

type TableItem = {
  itemId?: string;
  itemCount?: number;
  itemName?: string;
  amountDiff?: number;
  diff?: number;
};

type TableItemsResponse = {
  items?: TableItem[];
  createdAt?: string;
};

function normalizeReportDate(value?: string) {
  if (!value) return new Date().toISOString();

  const ruDate = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (ruDate) {
    const [, day, month, year] = ruDate;
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function categoryFor(itemId: string) {
  if (/(diamond|emerald|lapis|amethyst|quartz)/.test(itemId)) return 'gems';
  if (/(iron|gold|copper|netherite)/.test(itemId)) return 'metals';
  if (/(log|planks|wood|bamboo)/.test(itemId)) return 'wood';
  if (/(beef|bread|carrot|wheat|mutton|berries|potato|apple)/.test(itemId)) return 'food';
  if (/(wool|glass|stone|dirt|sand|moss|leaves|bush|grass|fern|petals|cactus|pumpkin)/.test(itemId)) return 'blocks';
  if (/(bucket|shears|flint|pickaxe|axe|shovel|sword|hoe)/.test(itemId)) return 'tools';
  return 'other';
}

function normalizeItem(item: TableItem, createdAt: string): ItemEntry {
  const id = item.itemId ?? 'minecraft:unknown';
  const count = item.itemCount ?? 0;
  const delta = item.amountDiff ?? 0;

  return {
    id,
    name: item.itemName ?? id.replace('minecraft:', ''),
    count,
    prev_count: count - delta,
    delta,
    category: categoryFor(id),
    last_updated: normalizeReportDate(createdAt),
  };
}

export async function fetchItems(signal?: AbortSignal): Promise<ItemEntry[]> {
  const payload = await tableApi<TableItemsResponse>('getTableItems', signal);
  return (payload.items ?? []).map((item) => normalizeItem(item, payload.createdAt ?? ''));
}
