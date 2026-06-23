import { Palette, Signal } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/items': 'Предметы',
  '/charts': 'Графики',
  '/players': 'Игроки',
};

export function Topbar({ onThemeOpen }: { onThemeOpen: () => void }) {
  const location = useLocation();
  const title = location.pathname.startsWith('/legal')
    ? 'Документы'
    : titles[location.pathname] ?? 'Игрок';

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" onClick={onThemeOpen} aria-label="Открыть тему">
          <Palette size={18} />
        </button>
        <div className="online-chip"><Signal size={15} /> Online</div>
      </div>
    </header>
  );
}
