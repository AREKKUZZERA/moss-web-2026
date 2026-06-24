import { useMemo, useState } from 'react';
import type { PlayerSummary } from '../../types/player';
import { PlayerCard } from './PlayerCard';

export function PlayerGrid({ players, onOpen }: { players: PlayerSummary[]; onOpen: (player: PlayerSummary) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('play');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result: PlayerSummary[] = [];

    for (const player of players) {
      if (normalizedQuery && !player.username.toLowerCase().includes(normalizedQuery)) continue;
      if (filter !== 'all' && (filter === 'online' ? !player.online : player.rank !== filter)) continue;
      result.push(player);
    }

    return result.sort((a, b) => {
      if (sort === 'seen') return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      if (sort === 'rank') return a.rank.localeCompare(b.rank);
      return b.play_time_hours - a.play_time_hours;
    });
  }, [players, query, filter, sort]);

  return (
    <section className="panel players-panel">
      <div className="players-controls">
        <input
          className="field player-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ник игрока"
          aria-label="Поиск игрока по нику"
        />
        <div className="players-toolbar">
          <div className="segmented player-filter-group" role="group" aria-label="Фильтр игроков">
            {['all', 'online', 'vip', 'admin'].map((entry) => (
              <button key={entry} type="button" className={filter === entry ? 'active' : ''} onClick={() => setFilter(entry)}>
                {entry === 'all' ? 'Все' : entry}
              </button>
            ))}
          </div>
          <select className="field player-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сортировка игроков">
            <option value="play">По времени игры</option>
            <option value="seen">По дате захода</option>
            <option value="rank">По рангу</option>
          </select>
        </div>
      </div>
      <div className="player-grid">
        {filtered.map((player) => <PlayerCard key={player.uuid} player={player} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
