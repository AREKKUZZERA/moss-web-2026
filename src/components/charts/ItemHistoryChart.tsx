import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useItemHistory } from '../../hooks/useCharts';
import { formatNumber } from '../../utils/format';

const periods = [
  ['7d', '7д'],
  ['30d', '30д'],
  ['90d', '90д'],
  ['all', 'Всё'],
] as const;

export function ItemHistoryChart() {
  const [period, setPeriod] = useState<(typeof periods)[number][0]>('30d');
  const history = useItemHistory('minecraft:diamond', period);
  const data = useMemo(() => history.map((point) => ({
    ...point,
    label: new Date(point.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
  })), [history]);

  return (
    <section className="panel chart-panel">
      <div className="section-head">
        <div>
          <h2>История предметов</h2>
          <p>Динамика количества предметов.</p>
        </div>
      </div>
      <div className="segmented">
        {periods.map(([key, label]) => (
          <button className={period === key ? 'active' : ''} key={key} type="button" onClick={() => setPeriod(key)}>{label}</button>
        ))}
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="itemFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--acc)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="var(--acc)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--b1)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--mut)" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis stroke="var(--mut)" tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(Number(value))} />
            <Tooltip contentStyle={{ background: 'var(--s2)', border: '1px solid var(--b2)', borderRadius: 'var(--radius)' }} />
            <Area type="monotone" dataKey="count" stroke="var(--acc)" fill="url(#itemFill)" strokeWidth={2} isAnimationActive={data.length < 1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
