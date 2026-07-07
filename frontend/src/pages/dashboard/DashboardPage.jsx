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

import { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Tabs } from '@/components/ui';
import { ChartSkeleton }     from '@/components/skeletons';
import { useAuth }           from '@/context/AuthContext';
import { useActivity }       from '@/context/ActivityContext';
import { useGoals }          from '@/context/GoalContext';
import { TYPE_MAP }          from '@/constants/activities';
import { getCommunityLeaderboard } from '@/api/leaderboardApi';

/* ── Mock data (KPI row and recommendations) ────────────────────────────────── */
import { MOCK_RECOMMENDATIONS } from '@/data/dashboardMock';

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
  const { logs, isLoading: logsLoading, fetchLogs } = useActivity();
  const { goals, isLoading: goalsLoading }           = useGoals();
  
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [chartTab, setChartTab] = useState('weekly');

  // Load backend logs
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Load backend leaderboard
  useEffect(() => {
    let active = true;
    getCommunityLeaderboard()
      .then((data) => {
        if (!active) return;
        const mapped = (data.all || []).slice(0, 5).map((u) => ({
          rank: u.rank,
          username: u.username,
          monthly: u.totalEmissionsSaved,
          badge: u.rank === 1 ? '🏆' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : null,
          delta: 0,
          isCurrentUser: u.userId === user?.userId,
        }));
        setLeaderboardEntries(mapped);
      })
      .catch((err) => {
        console.error('Failed to load dashboard leaderboard:', err);
      })
      .finally(() => {
        if (active) setLeaderboardLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Calculate real KPIs from actual activity logs
  const realKpi = useMemo(() => {
    // Parse logDate whether it comes back as "2026-07-06" (string) or [2026,7,6] (array)
    const parseLogDate = (l) => {
      const d = l.logDate ?? l.date;
      if (!d) return null;
      if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
      return new Date(d);
    };

    const now           = new Date();
    const todayStr      = now.toISOString().split('T')[0];
    const oneWeekAgo    = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
    const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEmissions = logs
      .filter((l) => {
        const d = parseLogDate(l);
        return d && d.toISOString().split('T')[0] === todayStr;
      })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const weeklyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= oneWeekAgo; })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const monthlyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= startOfMonth; })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const totalAll    = logs.reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);
    const distinctDays = new Set(
      logs.map((l) => {
        const d = parseLogDate(l);
        return d ? d.toISOString().split('T')[0] : null;
      }).filter(Boolean)
    ).size || 1;
    const avgEmissions = totalAll / distinctDays;

    return {
      today:     { value: todayEmissions,   trend: todayEmissions > 5 ? 'up' : 'down', delta: 0, deltaLabel: 'today' },
      weekly:    { value: weeklyEmissions,  trend: 'down', delta: 0, deltaLabel: 'last 7 days' },
      monthly:   { value: monthlyEmissions, trend: 'down', delta: 0, deltaLabel: 'this month' },
      avgPerDay: { value: avgEmissions,     trend: 'down', delta: 0, deltaLabel: 'daily average' },
    };
  }, [logs]);

  // Map real logs to format expected by RecentActivities widget
  const recentActivitiesList = useMemo(() => {
    return logs.slice(0, 5).map((l) => {
      const typeObj = TYPE_MAP[l.activityType];
      return {
        id: l.id,
        category: l.category,
        activityType: typeObj?.label ?? l.activityType,
        emissions: l.calculatedEmissions ?? 0,
        amount: l.amount,
        unit: l.unit,
        logDate: l.logDate,
        icon: typeObj?.icon ?? '🌱',
      };
    });
  }, [logs]);

  // Calculate real Weekly Trend (last 7 days stacked by category)
  const weeklyTrendData = useMemo(() => {
    const parseDate = (log) => {
      const d = log.logDate ?? log.date;
      if (!d) return null;
      if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
      return new Date(d);
    };

    const days7 = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = logs.filter((l) => {
      const d = parseDate(l);
      return d && d >= sevenDaysAgo;
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      const dayDateStr = d.toISOString().split('T')[0];

      const dayLogs = recentLogs.filter((l) => {
        const ld = parseDate(l);
        return ld && ld.toISOString().split('T')[0] === dayDateStr;
      });

      const dayObj = {
        day: dayLabel,
        transport: 0,
        energy: 0,
        food: 0,
        shopping: 0,
        other: 0,
        emissions: 0,
      };

      for (const l of dayLogs) {
        const cat = (l.category ?? 'other').toLowerCase();
        const value = l.calculatedEmissions ?? 0;
        if (cat in dayObj) {
          dayObj[cat] += value;
        } else {
          dayObj.other += value;
        }
        dayObj.emissions += value;
      }
      days7.push(dayObj);
    }
    return days7;
  }, [logs]);

  // Calculate real Monthly Comparison (last 6 months vs target)
  const monthlyCompData = useMemo(() => {
    const parseDate = (log) => {
      const d = log.logDate ?? log.date;
      if (!d) return null;
      if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
      return new Date(d);
    };

    const monthlyComp = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mLogs = logs.filter((l) => {
        const ld = parseDate(l);
        return ld && ld >= mStart && ld <= mEnd;
      });

      const sum = mLogs.reduce((s, l) => s + (l.calculatedEmissions ?? 0), 0);
      const targetVal = 150; // default target baseline

      monthlyComp.push({
        month: d.toLocaleString('default', { month: 'short' }),
        emissions: parseFloat(sum.toFixed(2)),
        target: targetVal,
      });
    }
    return monthlyComp;
  }, [logs]);

  // Calculate Category Pie Data (current month)
  const categoryData = useMemo(() => {
    const parseDate = (log) => {
      const d = log.logDate ?? log.date;
      if (!d) return null;
      if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
      return new Date(d);
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const mLogs = logs.filter((l) => {
      const ld = parseDate(l);
      return ld && ld >= startOfMonth;
    });

    const catMap = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      other: 0,
    };

    for (const l of mLogs) {
      const cat = (l.category ?? 'other').toLowerCase();
      const val = l.calculatedEmissions ?? 0;
      if (cat in catMap) {
        catMap[cat] += val;
      } else {
        catMap.other += val;
      }
    }

    const labels = {
      transport: 'Transport',
      energy: 'Energy',
      food: 'Food',
      shopping: 'Shopping',
      other: 'Other',
    };

    return Object.entries(catMap)
      .map(([cat, value]) => ({
        name: labels[cat],
        value: parseFloat(value.toFixed(2)),
        category: cat,
      }))
      .filter((item) => item.value > 0);
  }, [logs]);

  const globalLoading = logsLoading || leaderboardLoading || goalsLoading;

  return (
    <div className="space-y-6 fade-in">

      {/* ════════════════════════════════════════════════════════
          1 · WELCOME BANNER  (full width)
          ════════════════════════════════════════════════════════ */}
      <WelcomeBanner user={user} kpi={realKpi} />

      {/* ════════════════════════════════════════════════════════
          2 · KPI ROW  — Today / Week / Month / Avg
          ════════════════════════════════════════════════════════ */}
      <KpiRow kpi={realKpi} isLoading={globalLoading} />

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

            {globalLoading ? (
              <ChartSkeleton height={272} />
            ) : (
              <>
                {chartTab === 'weekly' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="green" dot size="sm">Last 7 days</Badge>
                      <span className="text-xs text-slate-400">stacked by category</span>
                    </div>
                    {weeklyTrendData.every(d => d.emissions === 0) ? (
                      <div className="flex h-[272px] flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No activity data in the last 7 days</p>
                        <p className="text-xs text-slate-400 mt-1">Log activities to see your trend</p>
                      </div>
                    ) : (
                      <WeeklyTrendChart data={weeklyTrendData} height={272} dailyGoal={5} />
                    )}
                  </div>
                )}
                {chartTab === 'monthly' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="teal" dot size="sm">6-month view</Badge>
                      <span className="text-xs text-slate-400">actual vs target</span>
                    </div>
                    <MonthlyComparisonChart data={monthlyCompData} height={272} />
                  </div>
                )}
                {chartTab === 'category' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="purple" dot size="sm">This month</Badge>
                      <span className="text-xs text-slate-400">by emission source</span>
                    </div>
                    {categoryData.length === 0 ? (
                      <div className="flex h-[272px] flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No category source data</p>
                        <p className="text-xs text-slate-400 mt-1">Log activities to see your CO₂ breakdown</p>
                      </div>
                    ) : (
                      <CategoryPieChart data={categoryData} height={272} innerRadius={64} />
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
 
          {/* ── Two-col sub-grid: Recent Activities + Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivities
              activities={recentActivitiesList}
              isLoading={logsLoading}
            />
            <Leaderboard
              entries={leaderboardEntries}
              isLoading={leaderboardLoading}
            />
          </div>
        </div>
 
        {/* ── Right sidebar block ─────────────────────────────── */}
        <div className="space-y-6">
          <GoalProgress goals={goals} isLoading={globalLoading} />
          <Recommendations recommendations={MOCK_RECOMMENDATIONS} isLoading={globalLoading} />
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
        {globalLoading
          ? <ChartSkeleton height={200} />
          : <MonthlyComparisonChart data={monthlyCompData} height={200} />}
      </Card>
    </div>
  );
}
