import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ItemEntry } from '../../types/item';
import { formatNumber } from '../../utils/format';

function truncateItemName(name: string) {
  return name.length > 20 ? `${name.slice(0, 19)}...` : name;
}

function ItemNameTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const name = payload?.value ?? '';

  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="central" fill="var(--txt2)" fontSize={13}>
      <title>{name}</title>
      {truncateItemName(name)}
    </text>
  );
}

function TopItemsBarComponent({ title, items, tone }: { title: string; items: ItemEntry[]; tone: 'green' | 'red' }) {
  const data = useMemo(() => items.map((item) => ({ name: item.name, delta: Math.abs(item.delta) })), [items]);

  return (
    <section className="panel">
      <div className="section-head compact">
        <h2>{title}</h2>
      </div>
      <div className="chart-box small">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, bottom: 4, left: 14 }}>
            <CartesianGrid stroke="var(--b1)" horizontal={false} />
            <XAxis type="number" stroke="var(--mut)" tickLine={false} tickFormatter={(value) => formatNumber(Number(value))} />
            <YAxis dataKey="name" type="category" width={150} tick={<ItemNameTick />} tickLine={false} axisLine={false} interval={0} tickMargin={10} />
            <Tooltip
              cursor={{ fill: 'var(--s5)', opacity: 0.55 }}
              contentStyle={{ background: 'var(--s2)', border: '1px solid var(--b2)', borderRadius: 'var(--radius)' }}
            />
            <Bar dataKey="delta" fill={tone === 'green' ? 'var(--grn)' : 'var(--red)'} radius={[0, 6, 6, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export const TopItemsBar = memo(TopItemsBarComponent);
