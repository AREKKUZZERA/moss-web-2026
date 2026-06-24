import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Archive,
  Bed,
  Bug,
  CalendarClock,
  Clock,
  Crosshair,
  Cuboid,
  DoorOpen,
  EyeOff,
  Fish,
  Footprints,
  Gauge,
  HandCoins,
  Hand,
  Hammer,
  HeartCrack,
  HeartPulse,
  MessageCircle,
  Mountain,
  Package,
  PackageMinus,
  PackagePlus,
  Pickaxe,
  Plane,
  ShieldCheck,
  ShipWheel,
  Skull,
  Swords,
  Table2,
  TimerReset,
  TrendingUp,
  Waves,
  Wheat,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PlayerFull } from '../../types/player';
import { formatDate, formatDuration, formatNumber, formatRelative } from '../../utils/format';
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

const chartDateTime = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const chartTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

function formatChartTick(value: string, denseSameDay: boolean) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return denseSameDay ? chartTime.format(parsed) : chartDateTime.format(parsed);
}

function StatPanel({
  title,
  items,
  className = '',
}: {
  title: string;
  items: Array<{ icon: LucideIcon; label: string; value: string }>;
  className?: string;
}) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      <h2>{title}</h2>
      <div className="split-stats">
        {items.map(({ icon: Icon, label, value }) => (
          <span className="metric-tile" key={label}>
            <Icon size={16} />
            <span className="metric-copy"><b>{value}</b>{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export function PlayerFullPage({ player }: { player: PlayerFull }) {
  const firstDay = player.stats_history[0]?.timestamp.slice(0, 10);
  const denseSameDay = Boolean(firstDay && player.stats_history.length > 1 && player.stats_history.every((point) => point.timestamp.startsWith(firstDay)));
  const data = player.stats_history.map((point) => ({
    timestamp: point.timestamp,
    hours: point.count,
  }));

  return (
    <div className="detail-grid">
      <section className={`player-hero panel${player.online ? ' is-online' : ''}`}>
        {player.online && <span className="player-live-badge hero-live-badge">В игре</span>}
        <img src={getPlayerSkin(player.username, player.uuid)} alt={player.username} loading="lazy" />
        <div>
          <h2>{player.username}</h2>
          <p className={`player-detail-status${player.online ? ' online' : ''}`}>
            <i /> {player.online ? 'Online' : `Был ${formatRelative(player.last_seen)}`} · <b className={`rank ${player.rank}`}>{player.rank}</b>
          </p>
          <div className="hero-metrics">
            <span><b>{formatDuration(player.play_time_hours)}</b> время</span>
            <span><b>{formatNumber(player.blocks_broken)}</b> добыто</span>
            <span><b>{formatNumber(player.distance_meters)}</b> метров</span>
          </div>
        </div>
      </section>
      <section className="panel chart-panel wide">
        <div className="section-head compact"><h2>История игрового времени</h2></div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid stroke="var(--b1)" vertical={false} />
            <XAxis dataKey="timestamp" stroke="var(--mut)" tickFormatter={(value) => formatChartTick(value, denseSameDay)} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis stroke="var(--mut)" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ч`} />
            <Tooltip
              contentStyle={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}
              labelFormatter={(value) => formatChartTick(String(value), false)}
              formatter={(value) => [`${value}ч`, 'Игровое время']}
            />
            <Area dataKey="hours" type="monotone" stroke="var(--acc-2)" fill="var(--acc-2-d)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
      {player.activity && (
        <StatPanel
          title="История активности"
          className="wide activity-history-panel"
          items={[
            { icon: CalendarClock, label: 'первое появление', value: formatDate(player.activity.first_seen) },
            { icon: CalendarClock, label: 'последняя отметка', value: formatDate(player.activity.last_seen) },
            { icon: TrendingUp, label: 'последний вход', value: formatDate(player.activity.last_join) },
            { icon: DoorOpen, label: 'последний выход', value: formatDate(player.activity.last_quit) },
            { icon: TimerReset, label: 'последняя сессия', value: formatDuration(player.activity.last_session_hours) },
            { icon: Clock, label: 'активен сейчас', value: formatDuration(player.activity.active_now_hours) },
            { icon: TrendingUp, label: 'записано в истории', value: formatDuration(player.activity.total_recorded_delta_hours) },
          ]}
        />
      )}
      <StatPanel
        title="Блоки"
        items={[
          { icon: Pickaxe, label: 'добыто', value: formatNumber(player.blocks_broken) },
          { icon: Cuboid, label: 'использовано', value: formatNumber(player.blocks_placed) },
          { icon: Hammer, label: 'скрафчено', value: formatNumber(player.blocks_crafted) },
          { icon: Wrench, label: 'сломано предметов', value: formatNumber(player.items_broken) },
        ]}
      />
      <StatPanel
        title="Бой"
        items={[
          { icon: Swords, label: 'убийства', value: formatNumber(player.kills, false) },
          { icon: Bug, label: 'мобы', value: formatNumber(player.mob_kills, false) },
          { icon: Crosshair, label: 'игроки', value: formatNumber(player.player_kills, false) },
          { icon: Skull, label: 'смерти', value: formatNumber(player.deaths, false) },
          { icon: HeartPulse, label: 'урон нанесен', value: formatNumber(player.damage_dealt, false) },
          { icon: HeartCrack, label: 'урон получен', value: formatNumber(player.damage_taken, false) },
          { icon: ShieldCheck, label: 'заблокировано щитом', value: formatNumber(player.damage_blocked_by_shield, false) },
        ]}
      />
      <StatPanel
        title="Активность"
        items={[
          { icon: Footprints, label: 'всего метров', value: formatNumber(player.distance_meters) },
          { icon: TrendingUp, label: 'прыжки', value: formatNumber(player.jumps, false) },
          { icon: DoorOpen, label: 'выходы', value: formatNumber(player.leave_game, false) },
          { icon: Bed, label: 'сон в кровати', value: formatNumber(player.sleep_in_bed, false) },
          { icon: EyeOff, label: 'время скрытности', value: formatDuration(player.sneak_time_hours) },
        ]}
      />
      <StatPanel
        title="Перемещение"
        items={[
          { icon: Footprints, label: 'пешком', value: `${formatNumber(player.walk_meters)}м` },
          { icon: Gauge, label: 'бегом', value: `${formatNumber(player.sprint_meters)}м` },
          { icon: Waves, label: 'вплавь', value: `${formatNumber(player.swim_meters)}м` },
          { icon: Plane, label: 'полет', value: `${formatNumber(player.fly_meters)}м` },
          { icon: Mountain, label: 'карабканье', value: `${formatNumber(player.climb_meters)}м` },
          { icon: HeartCrack, label: 'падение', value: `${formatNumber(player.fall_meters)}м` },
          { icon: ShipWheel, label: 'лодка', value: `${formatNumber(player.boat_meters)}м` },
          { icon: Archive, label: 'вагонетка', value: `${formatNumber(player.minecart_meters)}м` },
          { icon: Footprints, label: 'лошадь', value: `${formatNumber(player.horse_meters)}м` },
        ]}
      />
      <StatPanel
        title="Предметы"
        items={[
          { icon: PackagePlus, label: 'поднято', value: formatNumber(player.items_picked_up) },
          { icon: PackageMinus, label: 'выброшено', value: formatNumber(player.items_dropped) },
          { icon: Hand, label: 'использовано', value: formatNumber(player.items_used) },
          { icon: Hammer, label: 'скрафчено', value: formatNumber(player.items_crafted_total) },
        ]}
      />
      <StatPanel
        title="Мир"
        items={[
          { icon: Wheat, label: 'разведено животных', value: formatNumber(player.animals_bred, false) },
          { icon: Fish, label: 'поймано рыбы', value: formatNumber(player.fish_caught, false) },
          { icon: MessageCircle, label: 'разговоры с жителями', value: formatNumber(player.talked_to_villager, false) },
          { icon: HandCoins, label: 'торговля с жителями', value: formatNumber(player.traded_with_villager, false) },
          { icon: Table2, label: 'верстак', value: formatNumber(player.interacted_with_crafting_table, false) },
          { icon: Package, label: 'открыто сундуков', value: formatNumber(player.open_chest, false) },
        ]}
      />
      <TopList title="Топ добычи" entries={player.top_mined} />
      <TopList title="Топ использования" entries={player.top_used} />
      <TopList title="Топ крафта" entries={player.top_crafted} />
      <TopList title="Топ поднятых предметов" entries={player.top_picked_up} />
      <TopList title="Топ выброшенных предметов" entries={player.top_dropped} />
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
