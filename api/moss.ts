const defaultUpstream = 'http://213.21.57.115:8080/moss';
const timeoutMs = 6_000;

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
    const url = new URL(`${defaultUpstream}/${path}`);

    for (const [key, value] of Object.entries(query)) {
      if (key !== 'path' && typeof value === 'string') url.searchParams.set(key, value);
    }

    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (response.ok || attempt === 1) break;
      } catch (error) {
        lastError = error;
        if (attempt === 1) throw error;
      }
    }
    if (!response) throw lastError ?? new Error('Moss API request failed');
    const body = new Uint8Array(await response.arrayBuffer());
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    res.end(body);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    res.status(timedOut ? 504 : 502);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ error: timedOut ? 'Moss API timeout' : 'Moss API unavailable' });
  }
}
