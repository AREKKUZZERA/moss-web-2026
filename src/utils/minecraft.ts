type TextureManifest = {
  items: Record<string, { texture?: string } | undefined>;
};

const itemTextureManifestUrl = 'https://unpkg.com/minecraft-textures@26.2.0/dist/textures/json/1.21.id.json';
const minecraftAssetVersions = ['26.1.2', '26.1.1', '26.1', '1.21.11'];
let itemTextureManifest: Promise<TextureManifest> | undefined;

function loadItemTextureManifest() {
  itemTextureManifest ??= fetch(itemTextureManifestUrl).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load Minecraft item textures: ${response.status}`);
    }

    return response.json() as Promise<TextureManifest>;
  });

  return itemTextureManifest;
}

export async function getItemTexture(itemId: string) {
  const manifest = await loadItemTextureManifest();
  return manifest.items[itemId]?.texture ?? null;
}

export async function getItemTextureCandidates(itemId: string) {
  const texture = await getItemTexture(itemId);
  const normalizedId = itemId.replace(/^minecraft:/, '');
  const assetCandidates = minecraftAssetVersions.flatMap((version) => [
    `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${version}/assets/minecraft/textures/item/${normalizedId}.png`,
    `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${version}/assets/minecraft/textures/block/${normalizedId}.png`,
  ]);

  return Array.from(new Set([texture, ...assetCandidates].filter((src): src is string => Boolean(src))));
}

function encodeTextureId(value: string) {
  return encodeURIComponent(value.trim());
}

export function getPlayerAvatar(username: string, size = 48, fallbackId?: string) {
  const id = encodeTextureId(username || fallbackId || 'Steve');
  return `https://mc-heads.net/avatar/${id}/${size}`;
}

export function getPlayerSkin(username: string, fallbackId?: string) {
  const id = encodeTextureId(username || fallbackId || 'Steve');
  return `https://mc-heads.net/body/${id}/128`;
}
