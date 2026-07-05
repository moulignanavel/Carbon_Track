/**
 * ReportsPage.jsx  —  Analytics Module
 * ─────────────────────────────────────────────────────────────
 * Sections
 *   1. Period filter bar  (Daily / Weekly / Monthly / Yearly)
 *   2. Summary KPI cards  (Total · Top Category · Avg/Entry · Entries · vs Goal)
 *   3. Trend chart        (stacked bar for chosen period)
 *   4. Two-col row        (Category Pie  +  Weekly Trend line)
 *   5. Monthly Comparison (grouped bar — actual vs target)
 *   6. Category Breakdown (progress-bar table with delta badges)
 *   7. Top Activities     (ranked list of highest-emission entries)
 *
 * Data: mock (analyticsMock.js) — swap exports to API calls when ready.
 * Charts: Recharts — StackedBarChart, TrendLineChart, CategoryPieChart,
 *                    WeeklyTrendChart, MonthlyComparisonChart.
 */

import { useState, useMemo } from 'react';
import {
  Download, BarChart2, TrendingDown, TrendingUp,
  Calendar, Zap, Leaf, Target, Minus,
} from 'lucide-react';

import { formatEmission, formatDate, capitalize } from '@/utils/formatters';
import { CATEGORY_META } from '@/constants/activities';
import { COLORS } from '@/constants/theme';
import { Card, Badge, Button, StatCard, Tabs, Tooltip } from '@/components/ui';
import { ChartSkeleton } from '@/components/skeletons';

/* ── Charts ────────────────────────────────────────────────── */
import StackedBarChart,   { DEFAULT_SERIES } from '@/components/charts/StackedBarChart';
import TrendLineChart                         from '@/components/charts/TrendLineChart';
import CategoryPieChart                       from '@/components/charts/CategoryPieChart';
import WeeklyTrendChart                       from '@/components/charts/WeeklyTrendChart';
import MonthlyComparisonChart                 from '@/components/charts/MonthlyComparisonChart';

/* ── Mock data ─────────────────────────────────────────────── */
import {
  MOCK_DAILY, MOCK_WEEKLY, MOCK_MONTHLY, MOCK_YEARLY,
  MOCK_CATEGORY_BREAKDOWN, MOCK_SUMMARY, MOCK_TOP_ACTIVITIES,
} from '@/data/analyticsMock';
import { MOCK_WEEKLY_TREND, MOCK_MONTHLY_COMPARISON } from '@/data/dashboardMock';

/* ══════════════════════════════════════════════════════════════
   Period config
   ══════════════════════════════════════════════════════════════ */
const PERIOD_TABS = [
  { id: 'daily',   label: 'Daily'   },
  { id: 'weekly',  label: 'Weekly'  },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly'  },
];

const PERIOD_DATA = {
  daily:   MOCK_DAILY,
  weekly:  MOCK_WEEKLY,
  monthly: MOCK_MONTHLY,
  yearly:  MOCK_YEARLY,
};

const PERIOD_LABELS = {
  daily:   'Today vs Yesterday',
  weekly:  'This Week vs Last Week',
  monthly: 'This Month vs Last Month',
  yearly:  'YTD vs Last Year',
};

/* ── Trend line series (total line per period) ──────────────── */
const TREND_SERIES = [
  { key: 'total',  name: 'Total CO₂e',  color: COLORS.green[500]  },
  { key: 'target', name: 'Target',      color: '#f59e0b', dashed: true },
];

/* ── Category breakdown badge variants ──────────────────────── */
const CAT_BADGE = {
  transport:   'green',
  electricity: 'yellow',
  food:        'teal',
  shopping:    'purple',
  energy:      'red',
};

/* ══════════════════════════════════════════════════════════════
   Helper — delta badge
   ══════════════════════════════════════════════════════════════ */
function DeltaBadge({ current, prev }) {
  if (prev == null || prev === 0) return null;
  const pct  = ((current - prev) / prev) * 100;
  const down = pct <= 0;
  const Icon = down ? TrendingDown : TrendingUp;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums ${
      down ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
    }`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   Summary KPI row
   ══════════════════════════════════════════════════════════════ */
function SummaryRow({ summary, period }) {
  const { total, topCat, avgPerEntry, entries, target } = summary;
  const goalPct = Math.min(100, (total.value / target.value) * 100);
  const goalOver = total.value > target.value;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {/* Total */}
      <div className="card p-5 xl:col-span-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Emissions</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
          {formatEmission(total.value)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={total.value} prev={total.prev} />
          <span className="text-xs text-slate-400">{PERIOD_LABELS[period]}</span>
        </div>
      </div>

      {/* vs Goal */}
      <div className={`card p-5 xl:col-span-1 ${goalOver ? 'border-red-200 dark:border-red-900' : 'border-green-200 dark:border-green-900'}`}>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">vs {target.period}</p>
        <p className={`text-2xl font-bold tabular-nums leading-tight ${goalOver ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
          {goalPct.toFixed(0)}%
        </p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${goalOver ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(goalPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{formatEmission(target.value)} target</p>
      </div>

      {/* Top category */}
      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Top Source</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl" aria-hidden="true">
            {CATEGORY_META[topCat.value?.toLowerCase()]?.emoji ?? '📊'}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{topCat.value}</p>
            <p className="text-xs text-slate-400">{topCat.share} of total</p>
          </div>
        </div>
      </div>

      {/* Avg per entry */}
      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Avg / Activity</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
          {formatEmission(avgPerEntry.value)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={avgPerEntry.value} prev={avgPerEntry.prev} />
        </div>
      </div>

      {/* Entries */}
      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Activities</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {entries.value}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={entries.value} prev={entries.prev} />
          <span className="text-xs text-slate-400">{PERIOD_LABELS[period]}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Category Breakdown table
   ══════════════════════════════════════════════════════════════ */
function CategoryBreakdown({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="overflow-x-auto">
      <table className="table-root">
        <thead className="table-head">
          <tr>
            <th className="table-th w-8">#</th>
            <th className="table-th">Category</th>
            <th className="table-th text-right">CO₂e</th>
            <th className="table-th text-right">Share</th>
            <th className="table-th text-right">vs Prior</th>
            <th className="table-th min-w-[120px]">Distribution</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const sharePct = total > 0 ? (row.value / total) * 100 : 0;
            const meta     = CATEGORY_META[row.category] ?? {};
            return (
              <tr key={row.category} className="table-row">
                <td className="table-td text-slate-400 font-mono text-xs">{i + 1}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden="true">{meta.emoji ?? '📊'}</span>
                    <Badge variant={CAT_BADGE[row.category] ?? 'slate'} size="sm">
                      {row.name}
                    </Badge>
                  </div>
                </td>
                <td className="table-td text-right font-semibold tabular-nums">
                  {formatEmission(row.value)}
                </td>
                <td className="table-td text-right text-slate-500 tabular-nums">
                  {sharePct.toFixed(1)}%
                </td>
                <td className="table-td text-right">
                  <DeltaBadge current={row.value} prev={row.prev} />
                </td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden min-w-[80px]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${sharePct}%`,
                          background: meta.color ?? COLORS.green[500],
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums w-8 shrink-0">
                      {sharePct.toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="table-td text-center text-slate-400 py-8">
                No data for this period
              </td>
            </tr>
          )}
        </tbody>
        {/* Footer total */}
        {data.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 dark:border-slate-700">
              <td className="table-td" />
              <td className="table-td font-semibold text-slate-800 dark:text-slate-200">Total</td>
              <td className="table-td text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatEmission(total)}
              </td>
              <td className="table-td text-right font-semibold text-slate-500">100%</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Top Activities list
   ══════════════════════════════════════════════════════════════ */
function TopActivities({ activities }) {
  const max = activities[0]?.emissions ?? 1;
  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li key={a.rank} className="flex items-center gap-3">
          {/* Rank */}
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
            a.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
            a.rank === 2 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
            a.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>{a.rank}</span>

          {/* Icon */}
          <span className="text-lg leading-none shrink-0" aria-hidden="true">{a.icon}</span>

          {/* Label + bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{a.label}</p>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 tabular-nums shrink-0">
                {formatEmission(a.emissions)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(a.emissions / max) * 100}%`,
                  background: CATEGORY_META[a.category]?.color ?? COLORS.green[500],
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={CAT_BADGE[a.category] ?? 'slate'} size="xs">
                {CATEGORY_META[a.category]?.label ?? a.category}
              </Badge>
              <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');

  /* derive data for the current period */
  const stackedData = PERIOD_DATA[period] ?? [];
  const trendData   = useMemo(() => {
    /* For the trend line we want the 'total' field per row */
    return stackedData.map((row) => ({
      ...row,
      total: DEFAULT_SERIES.reduce((s, ser) => s + (row[ser.key] ?? 0), 0),
    }));
  }, [stackedData]);

  const summary    = MOCK_SUMMARY[period];
  const catData    = MOCK_CATEGORY_BREAKDOWN[period];

  /* Pie data from category breakdown */
  const pieData = catData.map((c) => ({
    name:     c.name,
    value:    c.value,
    category: c.category,
  }));

  /* Goal reference line value */
  const goalMap = { daily: 5, weekly: 35, monthly: 160, yearly: 1800 };

  return (
    <div className="space-y-6 fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Understand your carbon footprint trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period filter */}
          <Tabs
            tabs={PERIOD_TABS}
            variant="pills"
            defaultTab="monthly"
            onChange={setPeriod}
          />
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* ── 1. Summary KPIs ────────────────────────────────── */}
      <SummaryRow summary={summary} period={period} />

      {/* ── 2. Stacked bar + Trend line ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Stacked bar — 2/3 width on desktop */}
        <Card className="xl:col-span-2">
          <Card.Header
            title={`${capitalize(period)} Emissions`}
            subtitle="Stacked by category · kg CO₂e"
            action={
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-sm bg-green-500 shrink-0" aria-hidden="true" />
                Stacked
              </div>
            }
          />
          <StackedBarChart
            data={stackedData}
            height={288}
            series={DEFAULT_SERIES}
          />
        </Card>

        {/* Trend line — 1/3 width on desktop */}
        <Card>
          <Card.Header
            title="Total Trend"
            subtitle="vs target · kg CO₂e"
            action={<Badge variant="green" dot size="sm">Live</Badge>}
          />
          <TrendLineChart
            data={trendData}
            series={TREND_SERIES}
            height={288}
            goalLine={goalMap[period]}
            goalLabel={`${goalMap[period]}kg goal`}
          />
        </Card>
      </div>

      {/* ── 3. Pie + Weekly Trend ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category pie */}
        <Card>
          <Card.Header
            title="Category Split"
            subtitle={`${capitalize(period)} — proportional breakdown`}
          />
          {pieData.length > 0
            ? <CategoryPieChart data={pieData} height={288} innerRadius={64} />
            : (
              <div className="flex items-center justify-center h-72 text-sm text-slate-400">
                No data for this period
              </div>
            )}
        </Card>

        {/* Weekly trend (always last-7-days regardless of period filter) */}
        <Card>
          <Card.Header
            title="7-Day Trend"
            subtitle="Daily stacked by category"
            action={<Badge variant="slate" size="sm">Last 7 days</Badge>}
          />
          <WeeklyTrendChart
            data={MOCK_WEEKLY_TREND}
            height={288}
            dailyGoal={5}
          />
        </Card>
      </div>

      {/* ── 4. Monthly Comparison ──────────────────────────── */}
      <Card>
        <Card.Header
          title="Monthly Comparison"
          subtitle="Actual emissions vs monthly target — last 12 months"
          action={
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 shrink-0" aria-hidden="true" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 shrink-0" aria-hidden="true" />
                Target
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500 shrink-0" aria-hidden="true" />
                Over target
              </span>
            </div>
          }
        />
        <MonthlyComparisonChart data={MOCK_MONTHLY_COMPARISON} height={220} />
      </Card>

      {/* ── 5. Category breakdown + Top activities ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Category breakdown table — 2/3 */}
        <Card className="xl:col-span-2">
          <Card.Header
            title="Category Breakdown"
            subtitle={`${capitalize(period)} · with trend vs prior period`}
          />
          <CategoryBreakdown data={catData} />
        </Card>

        {/* Top activities — 1/3 */}
        <Card>
          <Card.Header
            title="Top Activities"
            subtitle="Highest single-entry emissions"
          />
          <TopActivities activities={MOCK_TOP_ACTIVITIES} />
        </Card>
      </div>
    </div>
  );
}
