import { createProxyHandler } from './proxy';

export default createProxyHandler(
  'http://213.21.57.115:24442/moss',
  'Moss API',
  'MOSS_API_UPSTREAM',
);
