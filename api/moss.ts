import { proxyGet } from './proxy';

const defaultUpstream = 'http://213.21.57.115:8080/moss';

function getUpstream() {
  const configuredUpstream = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.MOSS_API_UPSTREAM || defaultUpstream;
  return configuredUpstream.replace(':24442/moss', ':8080/moss');
}

export default async function handler(req: any, res: any) {
  await proxyGet(req, res, {
    upstream: getUpstream(),
    prefix: '',
    cacheControl: 'public, s-maxage=15, stale-while-revalidate=60',
    errorName: 'Moss API',
  });
}
