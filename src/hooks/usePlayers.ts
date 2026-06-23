import { useEffect, useState } from 'react';
import { fetchPlayer, fetchPlayers } from '../api/players';
import type { PlayerFull, PlayerSummary } from '../types/player';

export function usePlayers() {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchPlayers(ac.signal)
      .then(setPlayers)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return { players, loading, error };
}

export function usePlayer(uuid?: string) {
  const [player, setPlayer] = useState<PlayerFull | null>(null);
  const [loading, setLoading] = useState(Boolean(uuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    const ac = new AbortController();
    setLoading(true);
    fetchPlayer(uuid, ac.signal)
      .then(setPlayer)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [uuid]);

  return { player, loading, error };
}
