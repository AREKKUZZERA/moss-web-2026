import { Clock, Footprints, Pickaxe, Skull, Swords } from 'lucide-react';
import type { PlayerSummary } from '../../types/player';
import { formatDuration, formatNumber, formatRelative } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

export function PlayerCard({ player, onOpen }: { player: PlayerSummary; onOpen: (player: PlayerSummary) => void }) {
  const sessionLabel = player.activity?.active_now_hours ? `Сессия: ${formatDuration(player.activity.active_now_hours)}` : `Последний раз: ${formatRelative(player.last_seen)}`;

  return (
    <button className={`player-card${player.online ? ' is-online' : ''}`} type="button" onClick={() => onOpen(player)}>
      {player.online && <span className="player-live-badge">В игре</span>}
      <div className="player-head">
        <img src={getPlayerAvatar(player.username, 48, player.uuid)} alt={player.username} width={48} height={48} loading="lazy" />
        <div>
          <strong>{player.username}</strong>
          <span className="player-status"><i className={player.online ? 'online' : ''} /> {player.online ? 'Online' : 'Offline'} · <b className={`rank ${player.rank}`}>{player.rank}</b></span>
        </div>
      </div>
      <div className="player-stats">
        <span><Clock size={15} /> {formatDuration(player.play_time_hours)}</span>
        <span><Pickaxe size={15} /> {formatNumber(player.blocks_mined)}</span>
        <span><Footprints size={15} /> {formatNumber(player.distance_meters)}м</span>
        <span><Swords size={15} /> {formatNumber(player.kills, false)}</span>
        <span><Skull size={15} /> {formatNumber(player.deaths, false)}</span>
      </div>
      <small>{sessionLabel}</small>
    </button>
  );
}
