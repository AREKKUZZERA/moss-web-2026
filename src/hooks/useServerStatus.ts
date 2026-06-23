import { useEffect, useState } from 'react';
import { fetchServerStatus, getDisplayTps } from '../api/server';
import type { ServerStatus } from '../api/server';

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const refresh = () => {
      fetchServerStatus(ac.signal)
        .then(setStatus)
        .catch((e: Error) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    refresh();

    const tpsTimer = window.setInterval(() => {
      setStatus((current) => (
        current ? { ...current, tps: getDisplayTps(current.players_online) } : current
      ));
    }, 2500);
    const refreshTimer = window.setInterval(refresh, 30000);

    return () => {
      ac.abort();
      window.clearInterval(tpsTimer);
      window.clearInterval(refreshTimer);
    };
  }, []);

  return status;
}
