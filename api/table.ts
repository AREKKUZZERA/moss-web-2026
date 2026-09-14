const upstream = 'http://213.21.57.115:8542';

export const config = { regions: ['fra1'] };

export default async function handler(req: any, res: any) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path ?? '';

  const url = new URL(`${upstream}/${path}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path' && typeof value === 'string') {
      url.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(24_000),
    });

    const body = await response.arrayBuffer();

    res.status(response.status);
    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') ?? 'application/json'
    );
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=30'
    );

    res.end(Buffer.from(body));
  } catch (error) {
    console.error('Table API proxy error:', error);
    res.status(504).json({
      error: 'Table API timeout',
    });
  }
}