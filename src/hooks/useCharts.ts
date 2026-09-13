import { useEffect, useState } from 'react';
import { fetchItemHistory, fetchStatsOverview } from '../api/charts';
import type { HistoryPoint, StatsOverview } from '../types/stats';

export function useItemHistory(itemId: string, period: '7d' | '30d' | '90d' | 'all') {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetchItemHistory(itemId, period, ac.signal).then(setHistory).catch(() => undefined);
    return () => ac.abort();
  }, [itemId, period]);

  return history;
}

export function useStatsOverview() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setError(null);
    fetchStatsOverview(ac.signal)
      .then(setOverview)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return { overview, loading, error };
}
