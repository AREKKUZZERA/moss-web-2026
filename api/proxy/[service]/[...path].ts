const upstreams = {
  moss: 'http://213.21.57.115:24442/moss',
  table: 'http://213.21.57.115:8542',
} as const;

type Service = keyof typeof upstreams;

function isService(value: unknown): value is Service {
  return value === 'moss' || value === 'table';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const service = req.query?.service;
  if (!isService(service)) {
    res.status(404).end('Unknown API service');
    return;
  }

  const segments = req.query?.path;
  const path = Array.isArray(segments) ? segments.join('/') : typeof segments === 'string' ? segments : '';
  const query = typeof req.url === 'string' && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const target = `${upstreams[service]}/${path}${query}`;

  try {
    const upstream = await fetch(target, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    const body = Buffer.from(await upstream.arrayBuffer());

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Length', body.length);
    res.end(body);
  } catch {
    res.status(504).json({ error: 'Upstream API did not respond in time' });
  }
}
