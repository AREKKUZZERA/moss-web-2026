import { Clock, Skull, Swords } from 'lucide-react';
import type { PlayerSummary } from '../../types/player';
import { formatDuration, formatRelative } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

export function PlayerCard({ player, onOpen }: { player: PlayerSummary; onOpen: (player: PlayerSummary) => void }) {
  return (
    <button className="player-card" type="button" onClick={() => onOpen(player)}>
      <div className="player-head">
        <img src={getPlayerAvatar(player.username, 48, player.uuid)} alt={player.username} width={48} height={48} loading="lazy" />
        <div>
          <strong>{player.username}</strong>
          <span className="player-status"><i className={player.online ? 'online' : ''} /> {player.online ? 'Online' : 'Offline'} · <b className={`rank ${player.rank}`}>{player.rank}</b></span>
        </div>
      </div>
      <div className="player-stats">
        <span><Clock size={15} /> {formatDuration(player.play_time_hours)}</span>
        <span><Skull size={15} /> {player.deaths}</span>
        <span><Swords size={15} /> {player.kills}</span>
      </div>
      <small>Последний раз: {formatRelative(player.last_seen)}</small>
    </button>
  );
}
