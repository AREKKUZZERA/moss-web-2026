import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PlayerFull } from '../../types/player';
import { formatDuration, formatNumber, formatRelative } from '../../utils/format';
import { getPlayerSkin } from '../../utils/minecraft';

function labelStat(id: string) {
  return id.replace(/^minecraft:/, '').replaceAll('_', ' ');
}

function TopList({ title, entries }: { title: string; entries: PlayerFull['top_mined'] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="top-list">
        {entries.length ? entries.map((entry) => (
          <span key={entry.id}>
            <b>{labelStat(entry.id)}</b>
            <em>{formatNumber(entry.count, false)}</em>
          </span>
        )) : <small>Нет данных</small>}
      </div>
    </section>
  );
}

export function PlayerFullPage({ player }: { player: PlayerFull }) {
  const data = player.stats_history.map((point) => ({
    label: new Date(point.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    hours: point.count,
  }));

  return (
    <div className="detail-grid">
      <section className="player-hero panel">
        <img src={getPlayerSkin(player.username, player.uuid)} alt={player.username} loading="lazy" />
        <div>
          <h2>{player.username}</h2>
          <p>{player.rank} · {player.online ? 'online' : `был ${formatRelative(player.last_seen)}`}</p>
          <div className="hero-metrics">
            <span><b>{formatDuration(player.play_time_hours)}</b> время</span>
            <span><b>{formatNumber(player.blocks_broken)}</b> добыто</span>
            <span><b>{formatNumber(player.distance_meters)}</b> метров</span>
          </div>
        </div>
      </section>
      <section className="panel chart-panel wide">
        <div className="section-head compact"><h2>Текущее игровое время</h2></div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid stroke="var(--b1)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--mut)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--mut)" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--s2)', border: '1px solid var(--b2)' }} />
            <Area dataKey="hours" type="monotone" stroke="var(--acc-2)" fill="var(--acc-2-d)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Блоки</h2>
        <div className="split-stats">
          <span><b>{formatNumber(player.blocks_broken)}</b> добыто</span>
          <span><b>{formatNumber(player.blocks_placed)}</b> поставлено</span>
          <span><b>{formatNumber(player.blocks_crafted)}</b> скрафчено</span>
        </div>
      </section>
      <section className="panel">
        <h2>Бой</h2>
        <div className="split-stats">
          <span><b>{formatNumber(player.kills, false)}</b> убийства</span>
          <span><b>{formatNumber(player.mob_kills, false)}</b> мобы</span>
          <span><b>{formatNumber(player.player_kills, false)}</b> игроки</span>
          <span><b>{formatNumber(player.deaths, false)}</b> смерти</span>
          <span><b>{formatNumber(player.damage_dealt, false)}</b> урон нанесен</span>
          <span><b>{formatNumber(player.damage_taken, false)}</b> урон получен</span>
        </div>
      </section>
      <section className="panel">
        <h2>Активность</h2>
        <div className="split-stats">
          <span><b>{formatNumber(player.distance_meters)}</b> метров</span>
          <span><b>{formatNumber(player.jumps, false)}</b> прыжки</span>
          <span><b>{formatNumber(player.items_picked_up)}</b> поднято</span>
          <span><b>{formatNumber(player.items_dropped)}</b> выброшено</span>
        </div>
      </section>
      <TopList title="Топ добычи" entries={player.top_mined} />
      <TopList title="Топ использования" entries={player.top_used} />
      <TopList title="Топ предметов" entries={player.top_picked_up} />
      <TopList title="Топ мобов" entries={player.top_killed} />
      <TopList title="Причины смертей" entries={player.top_killed_by} />
      <section className="panel">
        <h2>Достижения</h2>
        <div className="achievement-list">
          {player.achievements.map((entry) => <span key={entry}>{entry}</span>)}
        </div>
      </section>
    </div>
  );
}
