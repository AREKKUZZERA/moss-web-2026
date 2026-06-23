import { mossApi } from './client';

export type ServerStatus = {
  online: boolean;
  players_online: number;
  players_peak: number;
  tps: number;
  version: string;
};

type HealthResponse = {
  status?: string;
  players_cached?: number;
  players_online?: number;
};

export async function fetchServerStatus(signal?: AbortSignal): Promise<ServerStatus> {
  const health = await mossApi<HealthResponse>('health', signal);
  return {
    online: health.status === 'ok',
    players_online: health.players_online ?? 0,
    players_peak: health.players_cached ?? 0,
    tps: 0,
    version: '1.21',
  };
}
