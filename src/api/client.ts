function apiBase(configuredBase: string | undefined, proxyBase: string) {
  // Production requests must stay same-origin so Vercel can proxy them to the
  // HTTP-only Minecraft services. A VITE_* override is useful only in dev.
  if (import.meta.env.PROD) return proxyBase;

  if (!configuredBase) return proxyBase;

  return configuredBase;
}

const MOSS_API_BASE = apiBase(import.meta.env.VITE_MOSS_API_BASE, '/api/moss');
const TABLE_API_BASE = apiBase(import.meta.env.VITE_TABLE_API_BASE, '/api/table');

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function getJson<T>(base: string, path: string, signal?: AbortSignal): Promise<T> {
  const requestSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000);
  const response = await fetch(joinUrl(base, path), {
    signal: requestSignal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json() as { error?: string };
      if (payload.error) detail = payload.error;
    } catch {
      // Keep the HTTP status when an upstream returns a non-JSON error page.
    }
    throw new Error(`API ${response.status}: ${detail || 'Request failed'}`);
  }

  return response.json() as Promise<T>;
}

export const mossApi = <T>(path: string, signal?: AbortSignal) => getJson<T>(MOSS_API_BASE, path, signal);
export const tableApi = <T>(path: string, signal?: AbortSignal) => getJson<T>(TABLE_API_BASE, path, signal);
