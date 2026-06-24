import { useMemo, useState } from 'react';
import type { ItemEntry } from '../../types/item';
import { ItemRow } from './ItemRow';

type DeltaSortMode = 'all' | 'up' | 'flat' | 'down';

function rank(item: ItemEntry) {
  if (item.delta > 0) return 0;
  if (item.delta === 0) return 1;
  return 2;
}

function matchesDeltaSort(item: ItemEntry, sort: DeltaSortMode) {
  if (sort === 'up') return item.delta > 0;
  if (sort === 'flat') return item.delta === 0;
  if (sort === 'down') return item.delta < 0;
  return true;
}

const minecraftCategoryOrder = [
  'Строительные блоки',
  'Цветные блоки',
  'Природные блоки',
  'Функциональные блоки',
  'Редстоун',
  'Инструменты',
  'Бой',
  'Еда и напитки',
  'Ингредиенты',
  'Яйца призыва',
  'Операторские предметы',
];

export function ItemsTable({ items }: { items: ItemEntry[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [deltaSort, setDeltaSort] = useState<DeltaSortMode>('all');
  const [page, setPage] = useState(1);
  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return ['all', ...minecraftCategoryOrder.filter((entry) => present.has(entry))];
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.id.includes(query.toLowerCase()))
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => matchesDeltaSort(item, deltaSort))
      .sort((a, b) => rank(a) - rank(b) || Math.abs(b.delta) - Math.abs(a.delta));
  }, [items, query, category, deltaSort]);

  const pageSize = 14;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="panel table-panel items-dashboard-panel">
      <div className="items-controls">
        <div className="items-controls-head">
          <h2>Экономика предметов</h2>
          <input
            className="field item-search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Найти предмет"
            aria-label="Поиск предмета"
          />
        </div>
        <div className="items-filter-grid">
          <div className="items-filter-group">
            <span>Категория</span>
            <select
              className="field item-category-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              aria-label="Категория предметов"
            >
              {categories.map((entry) => (
                <option key={entry} value={entry}>{entry === 'all' ? 'Все категории' : entry}</option>
              ))}
            </select>
          </div>
          <div className="items-filter-group items-delta-group">
            <span>Изменение</span>
            <div className="segmented delta-sort" role="group" aria-label="Изменение количества предметов">
              {[
                ['all', 'Все'],
                ['up', 'Рост'],
                ['flat', 'Без изменений'],
                ['down', 'Падение'],
              ].map(([value, label]) => (
                <button
                  className={deltaSort === value ? 'active' : ''}
                  key={value}
                  type="button"
                  onClick={() => { setDeltaSort(value as DeltaSortMode); setPage(1); }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Иконка</th>
              <th>Название</th>
              <th>Текущее кол-во</th>
              <th>Изменение</th>
              <th>Прошлое кол-во</th>
              <th>Категория</th>
              <th>Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, index) => <ItemRow key={item.id} item={item} index={(page - 1) * pageSize + index} />)}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty">Ничего не найдено</div>}
      <div className="pager">
        <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Назад</button>
        <span className="mono">{page} / {pages}</span>
        <button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>Вперёд</button>
      </div>
    </section>
  );
}
