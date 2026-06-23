import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PlayerSummary } from '../../types/player';
import { formatDuration, formatNumber } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

export function PlayerModal({ player, onClose }: { player: PlayerSummary | null; onClose: () => void }) {
  if (!player) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        <img src={getPlayerAvatar(player.username, 64, player.uuid)} alt={player.username} width={64} height={64} />
        <h2>{player.username}</h2>
        <div className="modal-stats">
          <span><b>{formatDuration(player.play_time_hours)}</b> время</span>
          <span><b>{formatNumber(player.deaths, false)}</b> смерти</span>
          <span><b>{formatNumber(player.kills, false)}</b> убийства</span>
          <span><b>{formatNumber(player.blocks_mined, false)}</b> блоков</span>
        </div>
        <Link className="primary-button" to={`/players/${player.uuid}`} onClick={onClose}>Полная статистика</Link>
      </section>
    </div>
  );
}
