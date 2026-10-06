type Request = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type Response = {
  status: (code: number) => Response;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: (body?: Uint8Array) => void;
};

type ProxyOptions = {
  upstream: string;
  prefix: string;
  timeoutMs?: number;
  cacheControl: string;
  errorName: string;
};

function queryPath(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join('/') : value || '';
}

export async function proxyGet(req: Request, res: Response, options: ProxyOptions) {
  if (req.method && !['GET', 'HEAD'].includes(req.method)) {
    res.status(405);
    res.setHeader('Allow', 'GET, HEAD');
    res.json({ error: 'Method not allowed' });
    return;
  }

  const query = req.query || {};
  const path = queryPath(query.path);
  const url = new URL(`${options.upstream.replace(/\/$/, '')}/${options.prefix}${path ? `/${path}` : ''}`);

  for (const [key, value] of Object.entries(query)) {
    if (key !== 'path' && typeof value === 'string') url.searchParams.set(key, value);
  }

  try {
    let response: ResponseLike | undefined;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(options.timeoutMs ?? 4_000),
        });
        if (![502, 503, 504].includes(response.status) || attempt === 1) break;
      } catch (error) {
        lastError = error;
        if (attempt === 1) throw error;
      }
    }

    if (!response) throw lastError ?? new Error('Proxy request failed');

    const body = new Uint8Array(await response.arrayBuffer());
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', options.cacheControl);
    res.end(body);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    res.status(timedOut ? 504 : 502);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ error: timedOut ? `${options.errorName} timeout` : `${options.errorName} unavailable` });
  }
}

type ResponseLike = {
  status: number;
  headers: Headers;
  arrayBuffer: () => Promise<ArrayBuffer>;
};
