import type { ItemEntry } from '../types/item';
import { itemTrackerApi } from './client';

type TableItem = {
  id?: string;
  current?: number;
  previous?: number;
  delta?: number;
};

type TableItemsResponse = {
  items?: TableItem[];
};

let pendingItemsRequest: Promise<ItemEntry[]> | null = null;

const categoryLabels = {
  building: 'Строительные блоки',
  colored: 'Цветные блоки',
  natural: 'Природные блоки',
  functional: 'Функциональные блоки',
  redstone: 'Редстоуновые блоки',
  tools: 'Инструменты и приспособления',
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
];

// These names and the order below follow the vanilla Creative inventory tabs.
// Keep specialised tabs ahead of broad material rules: a redstone torch is not
// simply a functional block, and a raw-iron block belongs to Natural blocks.
const redstoneItems = [
  'redstone',
  'redstone_torch',
  'redstone_lamp',
  'redstone_block',
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
  'lightning_rod',
  'copper_bulb',
  'redstone_ore',
  'sculk_sensor',
  'calibrated_sculk_sensor',
  'crafter',
  'rail',
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
  'ender_chest',
  'trapped_chest',
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
  'trial_spawner',
  'vault',
  'spawner',
  'end_portal_frame',
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
  'goat_horn',
  'bundle',
  'minecart',
  'chest_minecart',
  'furnace_minecart',
  'tnt_minecart',
  'hopper_minecart',
  'command_block_minecart',
];

const combatItems = [
  'sword',
  'trident',
  'mace',
  'wind_charge',
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
  'fire_charge',
  'end_crystal',
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
  'ominous_bottle',
  'dried_kelp',
  'rotten_flesh',
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

function isColoredBlock(id: string) {
  return colors.some((color) => coloredBlocks.some((block) => id.includes(`${color}_${block}`)));
}

function categoryFor(itemId: string) {
  const id = itemId.replace(/^minecraft:/, '');

  if (id.endsWith('_spawn_egg')) return categoryLabels.spawnEggs;
  if (/(^|_)(command_block|structure_block|structure_void|jigsaw|barrier|debug_stick|light)(_|$)/.test(id)) return categoryLabels.operator;
  if (isColoredBlock(id)) return categoryLabels.colored;

  // Exact IDs are used for multi-word blocks; suffixes only cover material
  // variants such as iron_pickaxe or diamond_chestplate.
  if (redstoneItems.some((entry) => id === entry || id.endsWith(`_${entry}`))) return categoryLabels.redstone;
  if (combatItems.some((entry) => id === entry || id.endsWith(`_${entry}`))) return categoryLabels.combat;
  if (toolsAndUtilities.some((entry) => id === entry || id.endsWith(`_${entry}`))) return categoryLabels.tools;
  if (foodAndDrinks.some((entry) => id === entry || id.endsWith(`_${entry}`))) return categoryLabels.food;
  if (/^raw_.*_block$/.test(id) || id.endsWith('_ore')) return categoryLabels.natural;
  if (ingredients.some((entry) => id === entry || id.endsWith(`_${entry}`) || id.startsWith(`${entry}_`))) return categoryLabels.ingredients;
  if (functionalBlocks.some((entry) => id === entry || id.endsWith(`_${entry}`) || id.startsWith(`${entry}_`))) return categoryLabels.functional;
  if (buildingBlocks.some((entry) => id === entry || id.endsWith(`_${entry}`) || id.startsWith(`${entry}_`))) return categoryLabels.building;
  if (naturalBlocks.some((entry) => id === entry || id.endsWith(`_${entry}`) || id.startsWith(`${entry}_`))) return categoryLabels.natural;
  if (id === 'dragon_egg') return categoryLabels.natural;

  return categoryLabels.ingredients;
}

function normalizeItem(item: TableItem): ItemEntry {
  const id = item.id ?? 'minecraft:unknown';
  const count = item.current ?? 0;
  const delta = item.delta ?? 0;

  return {
    id,
    name: id.replace('minecraft:', ''),
    count,
    prev_count: item.previous ?? count - delta,
    delta,
    category: categoryFor(id),
    last_updated: new Date().toISOString(),
  };
}

export async function fetchItems(signal?: AbortSignal): Promise<ItemEntry[]> {
  if (!pendingItemsRequest) {
    pendingItemsRequest = itemTrackerApi<TableItemsResponse>('?limit=1000&offset=0&sort=current&order=desc')
      .then((payload) => (payload.items ?? []).map((item) => normalizeItem(item)))
      .finally(() => {
        pendingItemsRequest = null;
      });
  }

  if (!signal) return pendingItemsRequest;

  return Promise.race([
    pendingItemsRequest,
    new Promise<ItemEntry[]>((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
  ]);
}
