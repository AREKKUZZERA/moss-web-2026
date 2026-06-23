import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { ItemHistoryChart } from '../components/charts/ItemHistoryChart';
import { StatsGrid } from '../components/charts/StatsGrid';
import { TopItemsBar } from '../components/charts/TopItemsBar';
import { useStatsOverview } from '../hooks/useCharts';

export function ChartsPage() {
  const { overview, loading } = useStatsOverview();
  document.title = 'MOSS · Графики';

  if (loading || !overview) return <div className="skeleton tall" />;

  return (
    <div className="page-stack">
      <StatsGrid overview={overview} />
      <ItemHistoryChart />
      <div className="top-charts-grid">
        <TopItemsBar title="ТОП 10 растущих" items={overview.top_growing} tone="green" />
        <TopItemsBar title="ТОП 10 падающих" items={overview.top_falling} tone="red" />
      </div>
      <div className="charts-activity">
        <ActivityHeatmap points={overview.activity_heatmap} />
      </div>
    </div>
  );
}
