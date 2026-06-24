import { memo } from 'react';
import type { ItemEntry } from '../../types/item';
import { formatDate, formatNumber, formatSigned } from '../../utils/format';
import { ItemIcon } from './ItemIcon';

function ItemRowComponent({ item, index }: { item: ItemEntry; index: number }) {
  const state = item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : 'flat';
  return (
    <tr className={`item-row ${state}`} style={{ animationDelay: `${Math.min(index, 18) * 24}ms` }}>
      <td className="mono">{index + 1}</td>
      <td><ItemIcon id={item.id} name={item.name} /></td>
      <td>
        <strong>{item.name}</strong>
        <small>{item.id}</small>
      </td>
      <td className="mono">{formatNumber(item.count, false)}</td>
      <td className={`mono delta ${state}`}>{formatSigned(item.delta)}</td>
      <td className="mono">{formatNumber(item.prev_count, false)}</td>
      <td><span className="category-chip">{item.category}</span></td>
      <td>{formatDate(item.last_updated)}</td>
    </tr>
  );
}

export const ItemRow = memo(ItemRowComponent);
