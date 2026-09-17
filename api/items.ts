const defaultUpstream = 'http://213.21.57.115:8787';
const timeoutMs = 8_000;

export default async function handler(req: any, res: any) {
  if (req.method && !['GET', 'HEAD'].includes(req.method)) {
    res.status(405);
    res.setHeader('Allow', 'GET, HEAD');
    res.json({ error: 'Method not allowed' });
    return;
  }

  try {
    const query = req.query || {};
    const path = Array.isArray(query.path) ? query.path.join('/') : query.path || '';
    const url = new URL(`${defaultUpstream}/api/items${path ? `/${path}` : ''}`);

    for (const [key, value] of Object.entries(query)) {
      if (key !== 'path' && typeof value === 'string') url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = new Uint8Array(await response.arrayBuffer());
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    res.end(body);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    res.status(timedOut ? 504 : 502);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ error: timedOut ? 'Item Tracker API timeout' : 'Item Tracker API unavailable' });
  }
}
