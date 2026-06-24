import { Clock, Radio } from 'lucide-react';
import type { ActivityLeader } from '../../types/stats';
import { formatDuration, formatNumber, formatRelative } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

function ActivityRows({ leaders }: { leaders: ActivityLeader[] }) {
  if (!leaders.length) return <small className="muted-line">Нет данных активности</small>;

  return (
    <div className="leader-list">
      {leaders.map((leader) => (
        <div className="leader-row" key={`${leader.uuid}-${leader.rank}`}>
          <span className="leader-rank">#{leader.rank}</span>
          <img src={getPlayerAvatar(leader.name, 32, leader.uuid)} alt={leader.name} width={32} height={32} loading="lazy" />
          <span className="leader-name">
            <b>{leader.name}</b>
            <small>{leader.last_seen ? formatRelative(leader.last_seen) : 'нет отметки'}</small>
          </span>
          <span className="leader-value">
            <b>{formatDuration(leader.delta_hours)}</b>
            <small>прирост</small>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ActivityLeaders({ day, week }: { day: ActivityLeader[]; week: ActivityLeader[] }) {
  return (
    <section className="panel leaderboard-panel">
      <div className="section-head compact">
        <div>
          <h2>Лидеры активности</h2>
          <p>Прирост игрового времени по history 2.1.3.</p>
        </div>
        <Radio size={18} />
      </div>
      <div className="leaderboard-grid">
        <div>
          <h3><Clock size={14} /> За 24 часа</h3>
          <ActivityRows leaders={day} />
        </div>
        <div>
          <h3><Clock size={14} /> За неделю</h3>
          <ActivityRows leaders={week} />
        </div>
      </div>
      <div className="leader-footnote">
        {day[0]?.active_now_hours ? `Сейчас активен лидер дня: ${formatNumber(day[0].active_now_hours, false)}ч в текущей сессии` : 'Текущие сессии появятся после накопления activity history'}
      </div>
    </section>
  );
}
