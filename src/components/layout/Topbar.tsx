import { Palette, Signal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useServerStatus } from '../../hooks/useServerStatus';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/items': 'Предметы',
  '/charts': 'Графики',
  '/players': 'Игроки',
  '/changelog': 'Changelog',
};
const SERVER_PLAYER_LIMIT = 20;

export function Topbar({ onThemeOpen }: { onThemeOpen: () => void }) {
  const location = useLocation();
  const status = useServerStatus();
  const title = location.pathname.startsWith('/legal')
    ? 'Документы'
    : titles[location.pathname] ?? 'Игрок';
  const onlineLabel = status ? `${status.players_online}/${SERVER_PLAYER_LIMIT}` : '—';

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" onClick={onThemeOpen} aria-label="Открыть тему">
          <Palette size={18} />
        </button>
        <div className="online-chip"><Signal size={15} /> Онлайн {onlineLabel}</div>
      </div>
    </header>
  );
}
