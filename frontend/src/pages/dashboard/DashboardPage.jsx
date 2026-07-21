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

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Badge, Tabs } from '@/components/ui';
import { ChartSkeleton }     from '@/components/skeletons';
import { useAuth }           from '@/context/AuthContext';
import { useActivity }       from '@/context/ActivityContext';
import { useGoals }          from '@/context/GoalContext';
import { TYPE_MAP }          from '@/constants/activities';
import { getCommunityLeaderboard } from '@/api/leaderboardApi';
import { getPlatformAverages, getUserPercentile } from '@/api/benchmarkingApi';
import recommendationsService from '@/services/api/recommendationsService';

/* ── Chart components ─────────────────────────────────────────── */
import WeeklyTrendChart      from '@/components/charts/WeeklyTrendChart';
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart';
import CategoryPieChart      from '@/components/charts/CategoryPieChart';
import PlatformBenchmarkChart from '@/components/charts/PlatformBenchmarkChart';

/* ── Widget components ────────────────────────────────────────── */
import WelcomeBanner    from './widgets/WelcomeBanner';
import KpiRow           from './widgets/KpiRow';
import GoalProgress     from './widgets/GoalProgress';
import RecentActivities from './widgets/RecentActivities';
import Recommendations  from './widgets/Recommendations';
import Leaderboard      from './widgets/Leaderboard';

/* ── Chart tab config ─────────────────────────────────────────── */
const CHART_TABS = [
  { id: 'weekly',   label: 'Weekly Trend'  },
  { id: 'monthly',  label: 'Monthly'       },
  { id: 'category', label: 'By Category'   },
  { id: 'benchmarks', label: 'vs Platform' },
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
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [chartTab, setChartTab] = useState('weekly');
  const [platformAverages, setPlatformAverages] = useState([]);
  const [percentile, setPercentile] = useState(null);

  // Load backend logs on mount or when an activity is logged
  useEffect(() => {
    fetchLogs();

    const handleActivityLogged = () => {
      fetchLogs();
    };

    window.addEventListener('activity-logged', handleActivityLogged);
    return () => {
      window.removeEventListener('activity-logged', handleActivityLogged);
    };
  }, [fetchLogs]);

  // Callback to fetch dashboard statistics
  const fetchDashboardStats = useCallback((active) => {
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

    recommendationsService.getRecommendations()
      .then((data) => {
        if (!active) return;
        const formatted = data.map((item, index) => {
          let icon = "💡";
          let title = "Tip";
          if (item.activityType.includes('flight')) {
            icon = "✈️"; title = "Flight Tip";
          } else if (item.activityType.includes('car') || item.activityType.includes('transport')) {
            icon = "🚗"; title = "Transport Tip";
          } else if (item.activityType.includes('beef') || item.activityType.includes('meat') || item.activityType.includes('food') || item.activityType.includes('lamb') || item.activityType.includes('mutton') || item.activityType.includes('chicken') || item.activityType.includes('poultry')) {
            icon = "🍔"; title = "Diet Tip";
          } else if (item.activityType.includes('energy') || item.activityType.includes('electricity')) {
            icon = "⚡"; title = "Energy Tip";
          } else if (item.activityType.includes('furniture')) {
            icon = "🛋️"; title = "Home Tip";
          } else if (item.activityType.includes('clothing') || item.activityType.includes('clothes') || item.activityType.includes('shopping')) {
            icon = "🛍️"; title = "Shopping Tip";
          }

          return {
            id: index,
            icon,
            title,
            detail: item.tip,
            impact: item.emissions ? `${item.emissions.toFixed(2)} kg CO₂e` : 'Low Impact',
            tag: 'AI Tip',
            tagColor: 'amber'
          };
        });
        setRecommendations(formatted);
      })
      .catch((err) => console.error('Failed to load recommendations:', err))
      .finally(() => { if (active) setRecsLoading(false); });

    getPlatformAverages()
      .then((data) => {
        if (!active) return;
        setPlatformAverages(data);
      })
      .catch((err) => console.error('Failed to load platform averages:', err));

    getUserPercentile()
      .then((data) => {
        if (!active) return;
        setPercentile(data.percentile);
      })
      .catch((err) => console.error('Failed to load user percentile:', err));
  }, [user]);

  // Load backend stats on mount or when activity is logged
  useEffect(() => {
    let active = true;
    fetchDashboardStats(active);

    const handleActivityLogged = () => {
      fetchDashboardStats(active);
    };

    window.addEventListener('activity-logged', handleActivityLogged);

    return () => {
      active = false;
      window.removeEventListener('activity-logged', handleActivityLogged);
    };
  }, [fetchDashboardStats]);

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
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr  = yesterdayDate.toISOString().split('T')[0];

    const oneWeekAgo    = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo   = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);

    const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const todayEmissions = logs
      .filter((l) => {
        const d = parseLogDate(l);
        return d && d.toISOString().split('T')[0] === todayStr;
      })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const yesterdayEmissions = logs
      .filter((l) => {
        const d = parseLogDate(l);
        return d && d.toISOString().split('T')[0] === yesterdayStr;
      })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const weeklyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= oneWeekAgo; })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const prevWeeklyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= twoWeeksAgo && d < oneWeekAgo; })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const monthlyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= startOfMonth; })
      .reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0);

    const prevMonthlyEmissions = logs
      .filter((l) => { const d = parseLogDate(l); return d && d >= startOfPrevMonth && d < startOfMonth; })
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
      today:     { value: todayEmissions,   trend: todayEmissions >= yesterdayEmissions ? 'up' : 'down', delta: todayEmissions - yesterdayEmissions, deltaLabel: 'vs yesterday' },
      weekly:    { value: weeklyEmissions,  trend: weeklyEmissions >= prevWeeklyEmissions ? 'up' : 'down', delta: weeklyEmissions - prevWeeklyEmissions, deltaLabel: 'vs last week' },
      monthly:   { value: monthlyEmissions, trend: monthlyEmissions >= prevMonthlyEmissions ? 'up' : 'down', delta: monthlyEmissions - prevMonthlyEmissions, deltaLabel: 'vs last month' },
      avgPerDay: { value: avgEmissions,     trend: avgEmissions > 20 ? 'up' : 'down', delta: avgEmissions - 20, deltaLabel: 'vs target' },
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

  // Calculate Benchmark Comparison Data (this month vs platform averages)
  const benchmarkData = useMemo(() => {
    const categories = ['transport', 'electricity', 'food', 'shopping', 'energy'];
    const labels = {
      transport: 'Transport',
      electricity: 'Electricity',
      food: 'Food',
      shopping: 'Shopping',
      energy: 'Energy',
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mLogs = logs.filter((l) => {
      const ld = l.logDate ?? l.date;
      if (!ld) return false;
      const d = Array.isArray(ld) ? new Date(ld[0], ld[1] - 1, ld[2]) : new Date(ld);
      return d >= startOfMonth;
    });

    const userCatMap = {};
    categories.forEach(cat => userCatMap[cat] = 0);
    userCatMap['other'] = 0;

    for (const l of mLogs) {
      const cat = (l.category ?? 'other').toLowerCase();
      if (cat in userCatMap) {
        userCatMap[cat] += (l.calculatedEmissions ?? 0);
      } else {
        userCatMap['other'] += (l.calculatedEmissions ?? 0);
      }
    }

    const platformCatMap = {};
    categories.forEach(cat => platformCatMap[cat] = 0);
    platformCatMap['other'] = 0;

    for (const p of platformAverages) {
      const cat = (p.category ?? 'other').toLowerCase();
      if (cat in platformCatMap) {
        platformCatMap[cat] = p.totalEmissions ?? 0;
      } else {
        platformCatMap['other'] += p.totalEmissions ?? 0;
      }
    }

    return categories.map((cat) => ({
      category: labels[cat],
      userVal: parseFloat((userCatMap[cat] || 0).toFixed(2)),
      avgVal: parseFloat((platformCatMap[cat] || 0).toFixed(2)),
    }));
  }, [logs, platformAverages]);

  const globalLoading = logsLoading || leaderboardLoading || goalsLoading || recsLoading;

  return (
    <div className="space-y-6 fade-in">

      {/* ════════════════════════════════════════════════════════
          1 · WELCOME BANNER  (full width)
          ════════════════════════════════════════════════════════ */}
      <WelcomeBanner user={user} kpi={realKpi} percentile={percentile} />

      {/* ════════════════════════════════════════════════════════
          2 · KPI ROW  — Today / Week / Month / Avg
          ════════════════════════════════════════════════════════ */}
      <KpiRow kpi={realKpi} isLoading={globalLoading} />

      {/* ════════════════════════════════════════════════════════
          3 · MAIN CONTENT GRID
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
                {chartTab === 'benchmarks' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="green" dot size="sm">Platform Benchmark</Badge>
                      <span className="text-xs text-slate-400">your monthly emissions vs platform average</span>
                    </div>
                    <PlatformBenchmarkChart data={benchmarkData} height={272} />
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
          <Recommendations recommendations={recommendations} isLoading={recsLoading} />
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
