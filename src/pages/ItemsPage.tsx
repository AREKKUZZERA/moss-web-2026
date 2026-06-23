import { ItemsTable } from '../components/items/ItemsTable';
import { useItems } from '../hooks/useItems';

export function ItemsPage() {
  const { items, loading, error } = useItems();
  document.title = 'MOSS · Предметы';

  if (loading) return <div className="skeleton tall" />;
  if (error) return <div className="empty">Ошибка загрузки: {error}</div>;

  return <ItemsTable items={items} />;
}
