import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { GlobalStatsLeaders } from '../components/charts/GlobalStatsLeaders';
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
      <StatsGrid overview={overview} variant="marquee" />
      <div className="dashboard-grid">
        <ItemHistoryChart />
        <ActivityHeatmap
          points={overview.playtime_heatmap}
          title="Игровое время"
          description="365 дней игрового времени."
          unitLabel="ч"
          tone="green"
        />
      </div>
      <div className="top-charts-grid">
        <TopItemsBar title="ТОП рост" items={overview.top_growing} tone="green" />
        <TopItemsBar title="ТОП падение" items={overview.top_falling} tone="red" />
      </div>
      <div className="dashboard-grid">
        <ActivityHeatmap points={overview.activity_heatmap} title="Активность по предметам" description="365 дней изменений предметов." unitLabel="предметов" />
        <GlobalStatsLeaders
          playtime={overview.global_leaders.playtime}
          deaths={overview.global_leaders.deaths}
          playerKills={overview.global_leaders.player_kills}
        />
      </div>
      <ItemsTable items={items} />
    </div>
  );
}

function SkeletonPage() {
  return <div className="skeleton-grid">{Array.from({ length: 8 }, (_, i) => <span className="skeleton" key={i} />)}</div>;
}
