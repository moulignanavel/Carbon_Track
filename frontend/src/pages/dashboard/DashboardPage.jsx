/**
 * DashboardPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Full CarbonTrack dashboard — all sections assembled into a
 * responsive three-breakpoint grid:
 *
 *   Mobile  (< 768px)  — single column, stacked
 *   Tablet  (768-1280) — 2-column grid for charts + cards
 *   Desktop (> 1280px) — 3-column wide layout
 *
 * Data: mock (dashboardMock.js) — swap to API calls when ready.
 * Charts: Recharts — WeeklyTrendChart, MonthlyComparisonChart,
 *         CategoryPieChart (all with custom tooltips).
 */

import { useState, useEffect } from 'react';
import { Card, Badge, Tabs } from '@/components/ui';
import { ChartSkeleton }     from '@/components/skeletons';
import { useAuth }           from '@/context/AuthContext';

/* ── Mock data ────────────────────────────────────────────────── */
import {
  MOCK_KPI,
  MOCK_GOALS,
  MOCK_WEEKLY_TREND,
  MOCK_MONTHLY_COMPARISON,
  MOCK_CATEGORY_DATA,
  MOCK_RECENT_ACTIVITIES,
  MOCK_RECOMMENDATIONS,
  MOCK_LEADERBOARD,
} from '@/data/dashboardMock';

/* ── Chart components ─────────────────────────────────────────── */
import WeeklyTrendChart      from '@/components/charts/WeeklyTrendChart';
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart';
import CategoryPieChart      from '@/components/charts/CategoryPieChart';

/* ── Widget components ────────────────────────────────────────── */
import WelcomeBanner    from './widgets/WelcomeBanner';
import KpiRow           from './widgets/KpiRow';
import GoalProgress     from './widgets/GoalProgress';
import RecentActivities from './widgets/RecentActivities';
import QuickLog         from './widgets/QuickLog';
import Recommendations  from './widgets/Recommendations';
import Leaderboard      from './widgets/Leaderboard';

/* ── Chart tab config ─────────────────────────────────────────── */
const CHART_TABS = [
  { id: 'weekly',   label: 'Weekly Trend'  },
  { id: 'monthly',  label: 'Monthly'       },
  { id: 'category', label: 'By Category'   },
];

/* ══════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user }     = useAuth();
  const [loading, setLoading]   = useState(true);
  const [chartTab, setChartTab] = useState('weekly');

  /* Simulate a short loading state so skeletons are visible */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6 fade-in">

      {/* ════════════════════════════════════════════════════════
          1 · WELCOME BANNER  (full width)
          ════════════════════════════════════════════════════════ */}
      <WelcomeBanner user={user} kpi={MOCK_KPI} />

      {/* ════════════════════════════════════════════════════════
          2 · KPI ROW  — Today / Week / Month / Avg
          ════════════════════════════════════════════════════════ */}
      <KpiRow kpi={MOCK_KPI} isLoading={loading} />

      {/* ════════════════════════════════════════════════════════
          3 · QUICK LOG  (full width)
          ════════════════════════════════════════════════════════ */}
      <QuickLog />

      {/* ════════════════════════════════════════════════════════
          4 · MAIN CONTENT GRID
              Desktop  → 3 cols [chart×2 | goal progress]
              Tablet   → 2 cols [chart×1 | goal progress] stacked
              Mobile   → 1 col  fully stacked
          ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left block: tabbed charts (spans 2 cols on desktop) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Tabbed chart panel */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Emissions Analysis
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  CO₂e · kg
                </p>
              </div>
              <Tabs
                tabs={CHART_TABS}
                variant="pills"
                defaultTab="weekly"
                onChange={setChartTab}
              />
            </div>

            {loading ? (
              <ChartSkeleton height={272} />
            ) : (
              <>
                {chartTab === 'weekly' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="green" dot size="sm">Last 7 days</Badge>
                      <span className="text-xs text-slate-400">stacked by category</span>
                    </div>
                    <WeeklyTrendChart data={MOCK_WEEKLY_TREND} height={272} dailyGoal={5} />
                  </div>
                )}
                {chartTab === 'monthly' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="teal" dot size="sm">6-month view</Badge>
                      <span className="text-xs text-slate-400">actual vs target</span>
                    </div>
                    <MonthlyComparisonChart data={MOCK_MONTHLY_COMPARISON} height={272} />
                  </div>
                )}
                {chartTab === 'category' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="purple" dot size="sm">This month</Badge>
                      <span className="text-xs text-slate-400">by emission source</span>
                    </div>
                    <CategoryPieChart data={MOCK_CATEGORY_DATA} height={272} innerRadius={64} />
                  </div>
                )}
              </>
            )}
          </Card>

          {/* ── Two-col sub-grid: Recent Activities + Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivities
              activities={MOCK_RECENT_ACTIVITIES}
              isLoading={loading}
            />
            <Leaderboard
              entries={MOCK_LEADERBOARD}
              isLoading={loading}
            />
          </div>
        </div>

        {/* ── Right sidebar block ─────────────────────────────── */}
        <div className="space-y-6">
          <GoalProgress goals={MOCK_GOALS} isLoading={loading} />
          <Recommendations recommendations={MOCK_RECOMMENDATIONS} isLoading={loading} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          5 · MONTHLY COMPARISON  (full width, always visible)
          ════════════════════════════════════════════════════════ */}
      <Card>
        <Card.Header
          title="Monthly Comparison"
          subtitle="Actual emissions vs monthly target"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 shrink-0" aria-hidden="true" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 shrink-0" aria-hidden="true" />
                Target
              </span>
            </div>
          }
        />
        {loading
          ? <ChartSkeleton height={200} />
          : <MonthlyComparisonChart data={MOCK_MONTHLY_COMPARISON} height={200} />}
      </Card>
    </div>
  );
}
