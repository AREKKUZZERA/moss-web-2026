import { Palette, Search, Signal } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/items': 'Предметы',
  '/charts': 'Графики',
  '/players': 'Игроки',
};

export function Topbar({ onThemeOpen }: { onThemeOpen: () => void }) {
  const location = useLocation();
  const title = titles[location.pathname] ?? 'Игрок';

  return (
    <header className="topbar">
      <div>
        <span className="crumb">MOSS</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={16} />
          <input placeholder="Поиск по серверу" />
        </label>
        <button className="icon-button" type="button" onClick={onThemeOpen} aria-label="Открыть тему">
          <Palette size={18} />
        </button>
        <div className="online-chip"><Signal size={15} /> Online</div>
      </div>
    </header>
  );
}
