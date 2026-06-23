import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { HeatmapPoint } from '../../types/stats';
import { formatNumber } from '../../utils/format';

const heatGap = 3;
const minColumns = 16;
const maxColumns = 42;
const minCell = 8;
const maxCell = 18;

function formatHeatmapDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function tooltipPosition(anchorX: number, anchorY: number, width: number, height: number) {
  const padding = 10;
  const left = clamp(anchorX - width / 2, padding, window.innerWidth - width - padding);
  const preferredTop = anchorY - height - 10;
  const top = preferredTop < padding ? anchorY + 14 : preferredTop;
  return { x: Math.max(10, left), y: top };
}

function heatmapLayout(width: number, height: number, count: number) {
  if (!width || !height || !count) return { columns: 24, cell: 12 };

  const ratio = width / height;
  const columns = clamp(Math.round(Math.sqrt(count * ratio)), minColumns, maxColumns);
  const rows = Math.ceil(count / columns);
  const cellByWidth = (width - (columns - 1) * heatGap) / columns;
  const cellByHeight = (height - (rows - 1) * heatGap) / rows;
  const cell = clamp(Math.floor(Math.min(cellByWidth, cellByHeight)), minCell, maxCell);

  return { columns, cell };
}

export function ActivityHeatmap({ points }: { points: HeatmapPoint[] }) {
  const max = Math.max(...points.map((point) => point.item_delta), 1);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => ({ columns: 24, cell: 12 }));

  useEffect(() => {
    if (!heatmapRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const next = heatmapLayout(entry.contentRect.width, entry.contentRect.height, points.length);
      setLayout((current) => (current.columns === next.columns && current.cell === next.cell ? current : next));
    });

    observer.observe(heatmapRef.current);
    return () => observer.disconnect();
  }, [points.length]);

  const hideTooltip = () => {
    if (!tooltipRef.current) return;
    tooltipRef.current.hidden = true;
  };

  const showTooltipForCell = (element: HTMLElement) => {
    if (!tooltipRef.current) return;
    const date = element.dataset.date ?? '';
    const delta = element.dataset.delta ?? '0';
    const rect = element.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top;
    const tooltip = tooltipRef.current;
    const dateElement = tooltip.querySelector('span');
    const deltaElement = tooltip.querySelector('b');

    if (dateElement) dateElement.textContent = formatHeatmapDate(date);
    if (deltaElement) deltaElement.textContent = `+${formatNumber(Number(delta), false)} предметов`;

    tooltip.hidden = false;
    const tooltipRect = tooltip.getBoundingClientRect();
    const position = tooltipPosition(anchorX, anchorY, tooltipRect.width, tooltipRect.height);
    tooltip.style.left = `${position.x}px`;
    tooltip.style.top = `${position.y}px`;
  };

  const getHeatTarget = (target: EventTarget | null) => (target instanceof HTMLElement ? target.closest<HTMLButtonElement>('.heat') : null);

  return (
    <section className="panel heatmap-panel">
      <div className="section-head compact">
        <h2>Активность</h2>
        <p>365 дней изменений.</p>
      </div>
      <div
        ref={heatmapRef}
        className="heatmap"
        aria-label="Календарная тепловая карта"
        style={{ '--heat-columns': layout.columns, '--heat-cell': `${layout.cell}px` } as CSSProperties}
        onBlurCapture={hideTooltip}
        onFocusCapture={(event) => {
          const target = getHeatTarget(event.target);
          if (target) showTooltipForCell(target);
        }}
        onPointerLeave={hideTooltip}
        onPointerOut={(event) => {
          const target = getHeatTarget(event.target);
          const nextTarget = getHeatTarget(event.relatedTarget);
          if (target && !nextTarget) hideTooltip();
        }}
        onPointerOver={(event) => {
          const target = getHeatTarget(event.target);
          if (target) showTooltipForCell(target);
        }}
      >
        {points.map((point) => {
          const level = Math.ceil((point.item_delta / max) * 4);
          const label = `${formatHeatmapDate(point.date)}: +${formatNumber(point.item_delta, false)} предметов`;
          return (
            <button
              key={point.date}
              type="button"
              className={`heat level-${level}`}
              aria-label={label}
              data-date={point.date}
              data-delta={point.item_delta}
            />
          );
        })}
      </div>
      <div ref={tooltipRef} className="heat-tooltip" role="tooltip" hidden>
        <span />
        <b />
      </div>
    </section>
  );
}
