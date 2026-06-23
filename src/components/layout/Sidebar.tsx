import { BarChart3, Box, ChartLine, Home, Settings, Sprout, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/items', label: 'Предметы', icon: Box },
  { to: '/charts', label: 'Графики', icon: ChartLine },
  { to: '/players', label: 'Игроки', icon: Users },
];

export function Sidebar() {
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Sprout size={18} /></span>
          <strong>MOSS</strong>
        </div>
        <nav className="nav-list" aria-label="Основная навигация">
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end={to === '/'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-section">Internal</div>
        <a className="nav-link muted" href="#settings">
          <Settings size={18} />
          <span>Настройки</span>
        </a>
        <div className="server-pill"><BarChart3 size={16} /> TPS 19.8</div>
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
