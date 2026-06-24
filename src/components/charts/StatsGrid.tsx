import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Box, Clock, Hammer, Pickaxe, Skull, Swords, TrendingUp, Users } from 'lucide-react';
import type { StatsOverview } from '../../types/stats';
import { formatNumber, formatNumberWithUnit } from '../../utils/format';

type StatsGridProps = {
  overview: StatsOverview;
  variant?: 'grid' | 'marquee';
};

function StatsGridComponent({ overview, variant = 'grid' }: StatsGridProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetSpeedRef = useRef(1);
  const [isStaticLayout, setIsStaticLayout] = useState(() => (
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));

  const cards = useMemo(() => [
    { label: 'Всего игроков', value: formatNumber(overview.server_totals.players_total, false), icon: Users, tone: 'cyan' },
    { label: 'Общее время', value: formatNumberWithUnit(overview.server_totals.total_playtime_hours, 'ч'), icon: Clock, tone: 'green' },
    { label: 'Смерти', value: formatNumber(overview.server_totals.total_deaths, false), icon: Skull, tone: 'red' },
    { label: 'Убийства', value: formatNumber(overview.server_totals.total_player_kills + overview.server_totals.total_mob_kills, false), icon: Swords, tone: 'acc' },
    { label: 'Добыто блоков', value: formatNumber(overview.server_totals.blocks_mined), icon: Pickaxe, tone: 'cyan' },
    { label: 'Скрафчено', value: formatNumber(overview.server_totals.items_crafted), icon: Hammer, tone: 'green' },
    { label: 'Всего предметов', value: formatNumber(overview.total_items), icon: Box, tone: 'acc' },
    { label: 'Уникальных типов предметов', value: formatNumber(overview.total_unique_items, false), icon: Activity, tone: 'cyan' },
    { label: 'Прирост за неделю', value: formatNumber(overview.turnover_week), icon: TrendingUp, tone: 'green' },
  ], [overview]);
  const isMarquee = variant === 'marquee' && !isStaticLayout;
  const visibleCards = useMemo(() => (isMarquee ? [...cards, ...cards] : cards), [cards, isMarquee]);

  useEffect(() => {
    const staticQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncLayoutMode = () => setIsStaticLayout(staticQuery.matches);

    syncLayoutMode();
    staticQuery.addEventListener('change', syncLayoutMode);

    return () => staticQuery.removeEventListener('change', syncLayoutMode);
  }, []);

  useEffect(() => {
    if (!isMarquee || !trackRef.current) return undefined;

    const track = trackRef.current;
    let rafId = 0;
    let lastTime = 0;
    let offset = 0;
    let currentSpeed = 1;

    const tick = (time: number) => {
      if (!lastTime) lastTime = time;

      const elapsed = Math.min(time - lastTime, 64);
      lastTime = time;
      currentSpeed += (targetSpeedRef.current - currentSpeed) * Math.min(elapsed / 420, 1);

      const loopWidth = track.scrollWidth / 2;
      if (loopWidth > 0) {
        offset = (offset + (loopWidth / 34) * currentSpeed * (elapsed / 1000)) % loopWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    const applyMotionMode = () => {
      cancelAnimationFrame(rafId);
      track.style.transform = '';
      lastTime = 0;
      offset = 0;
      rafId = requestAnimationFrame(tick);
    };

    applyMotionMode();

    return () => {
      cancelAnimationFrame(rafId);
      track.style.transform = '';
    };
  }, [isMarquee]);

  const setMarqueeSpeed = useCallback((speed: number) => {
    targetSpeedRef.current = speed;
  }, []);

  return (
    <div
      className={`stats-grid${isMarquee ? ' stats-marquee' : ''}`}
      onPointerEnter={() => setMarqueeSpeed(0.22)}
      onPointerLeave={() => setMarqueeSpeed(1)}
      onFocus={() => setMarqueeSpeed(0.22)}
      onBlur={() => setMarqueeSpeed(1)}
    >
      <div className="stats-track" ref={trackRef}>
        {visibleCards.map(({ label, value, icon: Icon, tone }, index) => (
          <article className={`stat-card ${tone}`} key={`${label}-${index}`} aria-hidden={isMarquee && index >= cards.length}>
            <Icon size={16} />
            <span>{label}</span>
            <strong className="mono">{value}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

export const StatsGrid = memo(StatsGridComponent);
