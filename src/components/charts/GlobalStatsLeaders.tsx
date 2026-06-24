import { Clock, Skull, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GlobalStatLeader } from '../../types/stats';
import { formatDuration, formatNumber } from '../../utils/format';
import { getPlayerAvatar } from '../../utils/minecraft';

type LeaderGroup = {
  title: string;
  icon: LucideIcon;
  entries: GlobalStatLeader[];
  formatValue?: (value: number) => string;
};

function StatLeaderColumn({ title, icon: Icon, entries, formatValue = (value) => formatNumber(value, false) }: LeaderGroup) {
  return (
    <div className="stat-leader-column">
      <h3><Icon size={13} /> {title}</h3>
      <div className="leader-list compact">
        {entries.length ? entries.slice(0, 3).map((entry) => (
          <div className="leader-row stat-leader-row" key={`${title}-${entry.uuid}-${entry.rank}`}>
            <span className="leader-rank">#{entry.rank}</span>
            <img src={getPlayerAvatar(entry.name, 28, entry.uuid)} alt={entry.name} width={28} height={28} loading="lazy" />
            <span className="leader-value"><b>{formatValue(entry.value)}</b></span>
          </div>
        )) : <small className="muted-line">Нет данных</small>}
      </div>
    </div>
  );
}

export function GlobalStatsLeaders({
  playtime,
  deaths,
  playerKills,
}: {
  playtime: GlobalStatLeader[];
  deaths: GlobalStatLeader[];
  playerKills: GlobalStatLeader[];
}) {
  return (
    <section className="panel leaderboard-panel global-leaders-panel">
      <div className="section-head compact">
        <div>
          <h2>Глобальные топы</h2>
          <p>Данные из /moss/top по vanilla custom-статам.</p>
        </div>
      </div>
      <div className="global-leaders-grid">
        <StatLeaderColumn title="Время" icon={Clock} entries={playtime} formatValue={(value) => formatDuration(value / 20 / 3600)} />
        <StatLeaderColumn title="Убийства" icon={Swords} entries={playerKills} />
        <StatLeaderColumn title="Смерти" icon={Skull} entries={deaths} />
      </div>
    </section>
  );
}
