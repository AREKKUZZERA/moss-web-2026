import { useParams } from 'react-router-dom';
import { PlayerFullPage } from '../components/players/PlayerFullPage';
import { usePlayer } from '../hooks/usePlayers';

export function PlayerDetailPage() {
  const { uuid } = useParams();
  const { player, loading, error } = usePlayer(uuid);
  document.title = player ? `MOSS · ${player.username}` : 'MOSS · Игрок';

  if (loading) return <div className="skeleton tall" />;
  if (error || !player) return <div className="empty">Игрок не найден</div>;

  return <PlayerFullPage player={player} />;
}
