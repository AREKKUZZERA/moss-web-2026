import { BarChart3, Box, ChartLine, Home, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useServerStatus } from '../../hooks/useServerStatus';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/items', label: 'Предметы', icon: Box },
  { to: '/charts', label: 'Графики', icon: ChartLine },
  { to: '/players', label: 'Игроки', icon: Users },
];

export function Sidebar() {
  const status = useServerStatus();
  const tps = status?.tps ?? 20;

  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-cover" src="/MOSS-cover.png" alt="MOSS" />
          <img className="brand-logo" src="/MOSS-logo.png" alt="MOSS" />
        </div>
        <nav className="nav-list" aria-label="Основная навигация">
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end={to === '/'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="server-pill"><BarChart3 size={16} /> TPS {tps.toFixed(tps === 20 ? 0 : 1)}</div>
      </aside>
      <nav className="bottom-nav" aria-label="Мобильная навигация">
        {mainNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-link ${isActive ? 'active' : ''}`} end={to === '/'}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
