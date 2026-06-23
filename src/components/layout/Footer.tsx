import { Link } from 'react-router-dom';

const documentLinks = [
  { to: '/legal/offer', label: 'Договор оферты' },
  { to: '/legal/terms', label: 'Пользовательское соглашение' },
  { to: '/legal/privacy', label: 'Политика конфиденциальности' },
  { to: '/legal/rules', label: 'Правила проекта' },
  { to: '/legal/contacts', label: 'Контакты' },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-meta">
        <strong>Проект: MOSS</strong>
        <span>© {new Date().getFullYear()} команда default squad</span>
        <span>Разработчик: arekkuzzera</span>
      </div>
      <nav className="footer-links" aria-label="Документы проекта">
        {documentLinks.map(({ to, label }) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
