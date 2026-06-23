import { useEffect, useState } from 'react';
import { fetchItems } from '../api/items';
import type { ItemEntry } from '../types/item';

export function useItems() {
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetchItems(ac.signal)
      .then(setItems)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return { items, loading, error };
}
