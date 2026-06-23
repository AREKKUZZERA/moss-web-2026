import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { ThemeEditor } from '../theme/ThemeEditor';
import { useTheme } from '../../hooks/useTheme';

export function Layout() {
  const [themeOpen, setThemeOpen] = useState(false);
  useTheme();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar onThemeOpen={() => setThemeOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ThemeEditor open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
