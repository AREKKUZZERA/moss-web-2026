import { Clock, Footprints, Pickaxe, Skull, Swords, TrendingUp, UserRoundX, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PlayerSummary } from '../../types/player';
import { formatDuration, formatNumber } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

export function PlayerModal({ player, onClose }: { player: PlayerSummary | null; onClose: () => void }) {
  if (!player) return null;
  const stats = [
    { icon: Clock, value: formatDuration(player.play_time_hours), label: 'время' },
    { icon: Pickaxe, value: formatNumber(player.blocks_mined), label: 'добыто' },
    { icon: Footprints, value: formatNumber(player.distance_meters), label: 'метров' },
    { icon: TrendingUp, value: formatNumber(player.jumps, false), label: 'прыжки' },
    { icon: Skull, value: formatNumber(player.deaths, false), label: 'смерти' },
    { icon: Swords, value: formatNumber(player.kills, false), label: 'убийства' },
    { icon: UserRoundX, value: formatNumber(player.mob_kills, false), label: 'мобы' },
    { icon: Swords, value: formatNumber(player.player_kills, false), label: 'игроки' },
  ];
  const activityStats = player.activity ? [
    { icon: Clock, value: formatDuration(player.activity.total_recorded_delta_hours), label: 'записано history' },
    { icon: TrendingUp, value: formatDuration(player.activity.last_session_hours), label: 'последняя сессия' },
  ] : [];

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className={`modal${player.online ? ' is-online' : ''}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        <img src={getPlayerAvatar(player.username, 64, player.uuid)} alt={player.username} width={64} height={64} />
        <h2>{player.username}</h2>
        <span className={`player-modal-status${player.online ? ' online' : ''}`}>
          <i /> {player.online ? 'Online' : 'Offline'} · <b className={`rank ${player.rank}`}>{player.rank}</b>
        </span>
        <div className="modal-stats">
          {[...stats, ...activityStats].map(({ icon: Icon, value, label }) => (
            <span className="metric-tile" key={label}>
              <Icon size={16} />
              <span className="metric-copy"><b>{value}</b>{label}</span>
            </span>
          ))}
        </div>
        <Link className="primary-button" to={`/players/${player.uuid}`} onClick={onClose}>Полная статистика</Link>
      </section>
    </div>
  );
}
