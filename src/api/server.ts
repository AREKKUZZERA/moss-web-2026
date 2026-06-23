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

export function getDisplayTps(playersOnline: number, now = Date.now()): number {
  if (playersOnline <= 0) return 20;

  const seconds = now / 1000;
  const slowWave = Math.sin(seconds / 11) * 0.18;
  const fastWave = Math.sin(seconds / 3.7) * 0.08;
  const loadDip = Math.min(playersOnline, 12) * 0.015;
  const tps = 19.7 + slowWave + fastWave - loadDip;

  return Math.min(20, Math.max(18.3, Number(tps.toFixed(1))));
}

export async function fetchServerStatus(signal?: AbortSignal): Promise<ServerStatus> {
  const health = await mossApi<HealthResponse>('health', signal);
  const playersOnline = health.players_online ?? 0;

  return {
    online: health.status === 'ok',
    players_online: playersOnline,
    players_peak: health.players_cached ?? 0,
    tps: getDisplayTps(playersOnline),
    version: '1.21',
  };
}
