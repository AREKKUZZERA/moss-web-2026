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

const categoryLabels = {
  building: 'Строительные блоки',
  colored: 'Цветные блоки',
  natural: 'Природные блоки',
  functional: 'Функциональные блоки',
  redstone: 'Редстоун',
  tools: 'Инструменты',
  combat: 'Бой',
  food: 'Еда и напитки',
  ingredients: 'Ингредиенты',
  spawnEggs: 'Яйца призыва',
  operator: 'Операторские предметы',
} as const;

const colors = [
  'white',
  'light_gray',
  'gray',
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'cyan',
  'light_blue',
  'blue',
  'purple',
  'magenta',
  'pink',
];

const coloredBlocks = [
  'wool',
  'carpet',
  'terracotta',
  'concrete',
  'concrete_powder',
  'glazed_terracotta',
  'stained_glass',
  'stained_glass_pane',
  'candle',
  'banner',
  'bed',
  'shulker_box',
  'bundle',
];

const redstoneItems = [
  'redstone',
  'repeater',
  'comparator',
  'piston',
  'observer',
  'dispenser',
  'dropper',
  'hopper',
  'lever',
  'button',
  'pressure_plate',
  'tripwire_hook',
  'daylight_detector',
  'target',
  'sculk_sensor',
  'calibrated_sculk_sensor',
  'crafter',
  'trial_spawner',
  'vault',
  'rail',
  'minecart',
];

const functionalBlocks = [
  'crafting_table',
  'furnace',
  'blast_furnace',
  'smoker',
  'campfire',
  'soul_campfire',
  'anvil',
  'grindstone',
  'smithing_table',
  'cartography_table',
  'fletching_table',
  'loom',
  'stonecutter',
  'enchanting_table',
  'brewing_stand',
  'cauldron',
  'beacon',
  'conduit',
  'jukebox',
  'note_block',
  'lectern',
  'composter',
  'chest',
  'barrel',
  'shulker_box',
  'bookshelf',
  'chiseled_bookshelf',
  'decorated_pot',
  'flower_pot',
  'torch',
  'lantern',
  'chain',
  'ladder',
  'scaffolding',
  'sign',
  'hanging_sign',
  'item_frame',
  'painting',
  'armor_stand',
  'bell',
  'respawn_anchor',
  'lodestone',
  'end_crystal',
  'dragon_egg',
];

const toolsAndUtilities = [
  'pickaxe',
  'axe',
  'shovel',
  'hoe',
  'brush',
  'shears',
  'flint_and_steel',
  'fishing_rod',
  'carrot_on_a_stick',
  'warped_fungus_on_a_stick',
  'bucket',
  'boat',
  'raft',
  'saddle',
  'elytra',
  'compass',
  'clock',
  'spyglass',
  'lead',
  'name_tag',
  'map',
  'firework_rocket',
  'music_disc',
];

const combatItems = [
  'sword',
  'trident',
  'mace',
  'bow',
  'crossbow',
  'arrow',
  'shield',
  'helmet',
  'chestplate',
  'leggings',
  'boots',
  'horse_armor',
  'turtle_helmet',
  'totem_of_undying',
];

const foodAndDrinks = [
  'apple',
  'melon_slice',
  'sweet_berries',
  'glow_berries',
  'chorus_fruit',
  'carrot',
  'potato',
  'beetroot',
  'beef',
  'porkchop',
  'mutton',
  'chicken',
  'rabbit',
  'cod',
  'salmon',
  'tropical_fish',
  'pufferfish',
  'bread',
  'cookie',
  'cake',
  'pie',
  'stew',
  'soup',
  'honey_bottle',
  'milk_bucket',
  'potion',
];

const ingredients = [
  'coal',
  'charcoal',
  'raw_',
  'ingot',
  'nugget',
  'diamond',
  'emerald',
  'lapis_lazuli',
  'quartz',
  'amethyst',
  'prismarine_crystals',
  'prismarine_shard',
  'netherite_scrap',
  'stick',
  'string',
  'feather',
  'flint',
  'gunpowder',
  'paper',
  'book',
  'leather',
  'rabbit_hide',
  'egg',
  'clay_ball',
  'brick',
  'nether_brick',
  'echo_shard',
  'disc_fragment',
  'heart_of_the_sea',
  'nautilus_shell',
  'breeze_rod',
  'blaze_rod',
  'blaze_powder',
  'ender_pearl',
  'ender_eye',
  'ghast_tear',
  'magma_cream',
  'slime_ball',
  'phantom_membrane',
  'shulker_shell',
  'scute',
  'armadillo_scute',
  'honeycomb',
  'sugar',
  'wheat',
  'bone',
  'bone_meal',
  'dye',
  'smithing_template',
  'pottery_sherd',
  'banner_pattern',
];

const naturalBlocks = [
  'grass_block',
  'dirt',
  'podzol',
  'mycelium',
  'sand',
  'gravel',
  'clay',
  'mud',
  'snow',
  'ice',
  'stone',
  'deepslate',
  'tuff',
  'calcite',
  'dripstone',
  'basalt',
  'blackstone',
  'netherrack',
  'soul_sand',
  'soul_soil',
  'end_stone',
  'obsidian',
  'ore',
  'raw_',
  'log',
  'stem',
  'hyphae',
  'leaves',
  'azalea',
  'sapling',
  'propagule',
  'mangrove_roots',
  'flower',
  'rose_bush',
  'lilac',
  'peony',
  'sunflower',
  'grass',
  'fern',
  'bush',
  'petals',
  'cactus',
  'sugar_cane',
  'bamboo',
  'kelp',
  'seagrass',
  'vine',
  'moss',
  'mushroom',
  'fungus',
  'roots',
  'nether_sprouts',
  'wart',
  'coral',
  'sponge',
  'pumpkin',
  'melon',
  'cocoa_beans',
  'turtle_egg',
  'sniffer_egg',
];

const buildingBlocks = [
  'planks',
  'wood',
  'bamboo_block',
  'stone',
  'cobblestone',
  'andesite',
  'diorite',
  'granite',
  'deepslate',
  'tuff',
  'calcite',
  'dripstone_block',
  'bricks',
  'sandstone',
  'prismarine',
  'purpur',
  'quartz_block',
  'nether_bricks',
  'blackstone',
  'basalt',
  'end_stone_bricks',
  'mud_bricks',
  'resin_bricks',
  'copper',
  'iron_block',
  'gold_block',
  'diamond_block',
  'emerald_block',
  'lapis_block',
  'netherite_block',
  'slab',
  'stairs',
  'wall',
  'fence',
  'door',
  'trapdoor',
];

function hasAny(value: string, entries: string[]) {
  return entries.some((entry) => value.includes(entry));
}

function isColoredBlock(id: string) {
  return colors.some((color) => coloredBlocks.some((block) => id.includes(`${color}_${block}`)));
}

function categoryFor(itemId: string) {
  const id = itemId.replace(/^minecraft:/, '');

  if (id.endsWith('_spawn_egg')) return categoryLabels.spawnEggs;
  if (/(command_block|structure_block|structure_void|jigsaw|barrier|debug_stick|light)$/.test(id)) return categoryLabels.operator;
  if (isColoredBlock(id)) return categoryLabels.colored;
  if (hasAny(id, redstoneItems)) return categoryLabels.redstone;
  if (hasAny(id, combatItems)) return categoryLabels.combat;
  if (hasAny(id, toolsAndUtilities)) return categoryLabels.tools;
  if (hasAny(id, foodAndDrinks)) return categoryLabels.food;
  if (/^raw_.*_block$/.test(id) || id.endsWith('_ore')) return categoryLabels.natural;
  if (hasAny(id, ingredients)) return categoryLabels.ingredients;
  if (hasAny(id, functionalBlocks)) return categoryLabels.functional;
  if (hasAny(id, buildingBlocks)) return categoryLabels.building;
  if (hasAny(id, naturalBlocks)) return categoryLabels.natural;

  return categoryLabels.ingredients;
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
