import { Suspense, lazy } from 'react';
import { ActivityLeaders } from '../components/charts/ActivityLeaders';
import { GlobalStatsLeaders } from '../components/charts/GlobalStatsLeaders';
import { StatsGrid } from '../components/charts/StatsGrid';
import { useStatsOverview } from '../hooks/useCharts';

const ActivityHeatmap = lazy(() => import('../components/charts/ActivityHeatmap').then((module) => ({ default: module.ActivityHeatmap })));
const ItemHistoryChart = lazy(() => import('../components/charts/ItemHistoryChart').then((module) => ({ default: module.ItemHistoryChart })));
const TopItemsBar = lazy(() => import('../components/charts/TopItemsBar').then((module) => ({ default: module.TopItemsBar })));

function ChartFallback({ small = false }: { small?: boolean }) {
  return <div className={`skeleton${small ? '' : ' tall'}`} />;
}

export function ChartsPage() {
  const { overview, loading } = useStatsOverview();
  document.title = 'MOSS · Графики';

  if (loading || !overview) return <div className="skeleton tall" />;

  return (
    <div className="page-stack">
      <StatsGrid overview={overview} variant="marquee" />
      <Suspense fallback={<ChartFallback />}>
        <ItemHistoryChart />
      </Suspense>
      <ActivityLeaders day={overview.activity_top_day} week={overview.activity_top_week} />
      <Suspense fallback={<ChartFallback />}>
        <div className="top-charts-grid">
          <TopItemsBar title="ТОП 10 растущих" items={overview.top_growing} tone="green" />
          <TopItemsBar title="ТОП 10 падающих" items={overview.top_falling} tone="red" />
        </div>
      </Suspense>
      <GlobalStatsLeaders
        playtime={overview.global_leaders.playtime}
        deaths={overview.global_leaders.deaths}
        playerKills={overview.global_leaders.player_kills}
      />
      <Suspense fallback={<ChartFallback />}>
        <div className="charts-activity">
          <ActivityHeatmap
            points={overview.playtime_heatmap}
            title="Игровое время"
            description="365 дней игрового времени."
            unitLabel="ч"
            tone="green"
          />
          <ActivityHeatmap points={overview.activity_heatmap} title="Активность по предметам" description="365 дней изменений предметов." unitLabel="предметов" />
        </div>
      </Suspense>
    </div>
  );
}
