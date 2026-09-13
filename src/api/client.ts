function apiBase(configuredBase: string | undefined, proxyBase: string) {
  if (!configuredBase) return proxyBase;

  // An HTTPS page cannot fetch an HTTP endpoint. Keep production traffic on the
  // same-origin Vercel rewrite even when an old VITE_*_API_BASE value is present.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && /^http:\/\//i.test(configuredBase)) {
    return proxyBase;
  }

  return configuredBase;
}

const MOSS_API_BASE = apiBase(import.meta.env.VITE_MOSS_API_BASE, '/api/moss');
const TABLE_API_BASE = apiBase(import.meta.env.VITE_TABLE_API_BASE, '/api/table');

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function getJson<T>(base: string, path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(joinUrl(base, path), {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const mossApi = <T>(path: string, signal?: AbortSignal) => getJson<T>(MOSS_API_BASE, path, signal);
export const tableApi = <T>(path: string, signal?: AbortSignal) => getJson<T>(TABLE_API_BASE, path, signal);
