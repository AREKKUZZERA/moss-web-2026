import { useState } from 'react';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { PlayerModal } from '../components/players/PlayerModal';
import { usePlayers } from '../hooks/usePlayers';
import type { PlayerSummary } from '../types/player';

export function PlayersPage() {
  const { players, loading, error } = usePlayers();
  const [selected, setSelected] = useState<PlayerSummary | null>(null);
  document.title = 'MOSS · Игроки';

  if (loading) return <div className="skeleton tall" />;
  if (error) return <div className="empty">Ошибка загрузки: {error}</div>;

  return (
    <>
      <PlayerGrid players={players} onOpen={setSelected} />
      <PlayerModal player={selected} onClose={() => setSelected(null)} />
    </>
  );
}
