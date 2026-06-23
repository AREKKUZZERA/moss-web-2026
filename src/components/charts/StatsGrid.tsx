import { Activity, Box, Radio, TrendingUp } from 'lucide-react';
import type { StatsOverview } from '../../types/stats';
import { formatNumber } from '../../utils/format';

const SERVER_PLAYER_LIMIT = 20;

export function StatsGrid({ overview }: { overview: StatsOverview }) {
  const cards = [
    { label: 'Всего предметов', value: formatNumber(overview.total_items), icon: Box, tone: 'acc' },
    { label: 'Уникальных типов', value: formatNumber(overview.total_unique_items, false), icon: Activity, tone: 'cyan' },
    { label: 'Оборот за неделю', value: formatNumber(overview.turnover_week), icon: TrendingUp, tone: 'green' },
    { label: 'Онлайн', value: `${overview.online_now}/${SERVER_PLAYER_LIMIT}`, icon: Radio, tone: 'red' },
  ];

  return (
    <div className="stats-grid">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article className={`stat-card ${tone}`} key={label}>
          <Icon size={18} />
          <span>{label}</span>
          <strong className="mono">{value}</strong>
        </article>
      ))}
    </div>
  );
}
