import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { ActivityLeaders } from '../components/charts/ActivityLeaders';
import { GlobalStatsLeaders } from '../components/charts/GlobalStatsLeaders';
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
      <StatsGrid overview={overview} variant="marquee" />
      <ItemHistoryChart />
      <ActivityLeaders day={overview.activity_top_day} week={overview.activity_top_week} />
      <div className="top-charts-grid">
        <TopItemsBar title="ТОП 10 растущих" items={overview.top_growing} tone="green" />
        <TopItemsBar title="ТОП 10 падающих" items={overview.top_falling} tone="red" />
      </div>
      <GlobalStatsLeaders
        playtime={overview.global_leaders.playtime}
        deaths={overview.global_leaders.deaths}
        playerKills={overview.global_leaders.player_kills}
      />
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
    </div>
  );
}
