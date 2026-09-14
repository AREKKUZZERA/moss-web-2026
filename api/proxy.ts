type Request = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
};

type Response = {
  status: (code: number) => Response;
  setHeader: (name: string, value: string) => Response;
  end: (body?: Buffer) => void;
  json: (body: unknown) => void;
};

const proxyTimeoutMs = 8_000;

function environment(name: string) {
  const processLike = (globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }).process;
  return processLike?.env?.[name];
}

function requestPath(query: Request['query']) {
  const path = Array.isArray(query.path) ? query.path.join('/') : query.path ?? '';
  const url = new URL(path, 'http://proxy.invalid');

  for (const [key, value] of Object.entries(query)) {
    if (key !== 'path' && typeof value === 'string') url.searchParams.set(key, value);
  }

  return `${url.pathname.replace(/^\/+/, '')}${url.search}`;
}

export function createProxyHandler(defaultUpstream: string, errorName: string, envName: string) {
  return async function handler(req: Request, res: Response) {
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      res.status(405).setHeader('Allow', 'GET, HEAD').json({ error: 'Method not allowed' });
      return;
    }

    const upstream = environment(envName) ?? defaultUpstream;
    const url = new URL(requestPath(req.query), `${upstream.replace(/\/$/, '')}/`);

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(proxyTimeoutMs),
      });
      const body = Buffer.from(await response.arrayBuffer());
      res
        .status(response.status)
        .setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json')
        .setHeader('Cache-Control', 'no-store')
        .end(body);
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
      res
        .status(timedOut ? 504 : 502)
        .setHeader('Cache-Control', 'no-store')
        .json({ error: timedOut ? `${errorName} timeout` : `${errorName} unavailable` });
    }
  };
}
