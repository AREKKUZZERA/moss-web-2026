import { createProxyHandler } from './proxy';

export default createProxyHandler(
  'http://213.21.57.115:8542',
  'Table API',
  'TABLE_API_UPSTREAM',
);