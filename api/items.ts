import { proxyGet } from './proxy';

const defaultUpstream = 'http://213.21.57.115:8787';

export default async function handler(req: any, res: any) {
  const upstream = (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.TABLE_API_UPSTREAM || defaultUpstream;
  await proxyGet(req, res, {
    upstream,
    prefix: 'api/items',
    cacheControl: 'public, s-maxage=30, stale-while-revalidate=120',
    errorName: 'Item Tracker API',
  });
}
