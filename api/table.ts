const defaultUpstream = 'http://213.21.57.115:8542';
const timeoutMs = 8_000;

export default async function handler(req: any, res: any) {
  if (req.method && !['GET', 'HEAD'].includes(req.method)) {
    res.status(405).setHeader('Allow', 'GET, HEAD').json({ error: 'Method not allowed' });
    return;
  }

  try {
    const path = Array.isArray(req.query?.path) ? req.query.path.join('/') : req.query?.path ?? '';
    const upstream = process.env.TABLE_API_UPSTREAM || defaultUpstream;
    const url = new URL(`${upstream.replace(/\/$/, '')}/${path}`);

    for (const [key, value] of Object.entries(req.query ?? {})) {
      if (key !== 'path' && typeof value === 'string') url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = Buffer.from(await response.arrayBuffer());
    res
      .status(response.status)
      .setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json')
      .setHeader('Cache-Control', 'no-store')
      .end(body);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    res
      .status(timedOut ? 504 : 502)
      .setHeader('Cache-Control', 'no-store')
      .json({ error: timedOut ? 'Table API timeout' : 'Table API unavailable' });
  }
}