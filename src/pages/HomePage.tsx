import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { ItemHistoryChart } from '../components/charts/ItemHistoryChart';
import { StatsGrid } from '../components/charts/StatsGrid';
import { TopItemsBar } from '../components/charts/TopItemsBar';
import { ItemsTable } from '../components/items/ItemsTable';
import { useStatsOverview } from '../hooks/useCharts';
import { useItems } from '../hooks/useItems';

export function HomePage() {
  const { items, loading: itemsLoading } = useItems();
  const { overview } = useStatsOverview();
  document.title = 'MOSS · Dashboard';

  if (!overview || itemsLoading) return <SkeletonPage />;

  return (
    <div className="page-stack">
      <StatsGrid overview={overview} />
      <div className="dashboard-grid">
        <ItemHistoryChart />
        <ActivityHeatmap points={overview.activity_heatmap} />
      </div>
      <div className="top-charts-grid">
        <TopItemsBar title="ТОП рост" items={overview.top_growing} tone="green" />
        <TopItemsBar title="ТОП падение" items={overview.top_falling} tone="red" />
      </div>
      <ItemsTable items={items.slice(0, 18)} />
    </div>
  );
}

function SkeletonPage() {
  return <div className="skeleton-grid">{Array.from({ length: 8 }, (_, i) => <span className="skeleton" key={i} />)}</div>;
}
