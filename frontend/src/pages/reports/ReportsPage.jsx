/**
 * ReportsPage.jsx  —  Analytics Module (User-Scoped)
 * ─────────────────────────────────────────────────────────────
 * All data is derived in real-time from the current user's
 * activity logs (ActivityContext). No mock data is shown.
 *
 * Sections:
 *   1. Period filter bar  (Daily / Weekly / Monthly / Yearly)
 *   2. Summary KPI cards  (Total · Top Category · Avg/Entry · Entries)
 *   3. Stacked bar chart  (category breakdown over time)
 *   4. Category Pie  +  7-Day Trend line
 *   5. Category Breakdown table  (per-category totals + share)
 *   6. Top Activities  (ranked highest-emission entries)
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download, BarChart2, TrendingDown, TrendingUp,
  Calendar, Zap, Leaf, Target, FileText, Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useActivity }  from '@/context/ActivityContext';
import { useAuth }      from '@/context/AuthContext';
import { CATEGORY_META } from '@/constants/activities';
import { COLORS }        from '@/constants/theme';
import { formatEmission, capitalize } from '@/utils/formatters';
import { Card, Badge, Button, Tabs } from '@/components/ui';
import ecoScoreService from '@/services/api/ecoScoreService';
import { generateMonthlyReport } from '@/services/api/reportService';

import StackedBarChart, { DEFAULT_SERIES } from '@/components/charts/StackedBarChart';
import TrendLineChart                       from '@/components/charts/TrendLineChart';
import CategoryPieChart                     from '@/components/charts/CategoryPieChart';
import WeeklyTrendChart                     from '@/components/charts/WeeklyTrendChart';
import MonthlyComparisonChart               from '@/components/charts/MonthlyComparisonChart';

/* Category badge colours */
const CAT_BADGE = {
  transport:   'green',
  electricity: 'yellow',
  food:        'teal',
  shopping:    'purple',
  energy:      'red',
};

const CAT_KEY_MAP = {
  transport:   'activitiesPage.catTransport',
  electricity: 'activitiesPage.catElectricity',
  food:        'activitiesPage.catFood',
  shopping:    'activitiesPage.catShopping',
  energy:      'activitiesPage.catEnergy',
};

/* ──────────────────────────────────────────────────────────────
   Date helpers
   ────────────────────────────────────────────────────────────── */
function parseDate(log) {
  return new Date(log.logDate ?? log.date ?? log.createdAt ?? Date.now());
}

function startOf(period) {
  const now = new Date();
  if (period === 'daily')   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'monthly') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'yearly')  return new Date(now.getFullYear(), 0, 1);
  return new Date(0);
}

function prevStart(period) {
  const now = new Date();
  if (period === 'daily')  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (period === 'weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'monthly') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (period === 'yearly')  return new Date(now.getFullYear() - 1, 0, 1);
  return new Date(0);
}

function prevEnd(period) {
  const start = startOf(period);
  return new Date(start.getTime() - 1); // 1 ms before current period
}

function normalizeCat(log) {
  const cat = (log.category ?? '').toLowerCase();
  const act = (log.activityType ?? '').toLowerCase();

  if (cat.includes('transport') || act.includes('car') || act.includes('bus') || act.includes('flight') || act.includes('bike') || act.includes('train')) return 'transport';
  if (cat.includes('electric') || cat.includes('energy') || act.includes('kwh') || act.includes('grid')) return 'electricity';
  if (cat.includes('food') || cat.includes('diet') || act.includes('meal') || act.includes('dairy') || act.includes('meat') || act.includes('chicken') || act.includes('water')) return 'food';
  if (cat.includes('shop') || cat.includes('retail') || act.includes('spend') || act.includes('clothes') || act.includes('item')) return 'shopping';
  return 'other';
}

/* ──────────────────────────────────────────────────────────────
   Analytics derivation hook
   ────────────────────────────────────────────────────────────── */
function useAnalytics(logs, period, t) {
  return useMemo(() => {
    const pStart = startOf(period);
    const pEnd   = new Date();                         // now
    const qStart = prevStart(period);
    const qEnd   = prevEnd(period);

    const inRange = (log, from, to) => {
      const d = parseDate(log);
      return d >= from && d <= to;
    };

    let current = logs.filter((l) => inRange(l, pStart, pEnd));
    let prior   = logs.filter((l) => inRange(l, qStart, qEnd));

    // Fallback: if period filter yields 0 logs but user has logs in history, use all logs
    if (current.length === 0 && logs.length > 0) {
      current = logs;
    }

    const sumEmissions = (arr) =>
      arr.reduce((s, l) => s + (l.calculatedEmissions ?? l.co2eKg ?? 0), 0);

    const totalNow  = sumEmissions(current);
    const totalPrev = sumEmissions(prior);

    /* Category breakdown */
    const catMap = {};
    const catPrev = {};
    for (const l of current) {
      const cat = normalizeCat(l);
      catMap[cat] = (catMap[cat] ?? 0) + (l.calculatedEmissions ?? l.co2eKg ?? 0);
    }
    for (const l of prior) {
      const cat = normalizeCat(l);
      catPrev[cat] = (catPrev[cat] ?? 0) + (l.calculatedEmissions ?? l.co2eKg ?? 0);
    }

    const catData = Object.entries(catMap)
      .map(([cat, value]) => ({
        category: cat,
        name:     CAT_KEY_MAP[cat] ? t(CAT_KEY_MAP[cat]) : (CATEGORY_META[cat]?.label ?? capitalize(cat)),
        value,
        prev:     catPrev[cat] ?? 0,
      }))
      .sort((a, b) => b.value - a.value);

    const topCat = catData[0] ?? null;

    /* Stacked bar — group by day/week/month/year */
    const groupKey = (log) => {
      const d = parseDate(log);
      if (period === 'daily')   return d.toLocaleTimeString([], { hour: '2-digit' });
      if (period === 'weekly')  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      if (period === 'monthly') return `${d.getDate()}`;
      return `${d.toLocaleString('default', { month: 'short' })}`;
    };

    const grouped = {};
    
    // Pre-initialize keys based on period to create a full chronological timeline
    if (period === 'daily') {
      for (let h = 0; h <= 23; h++) {
        const tempDate = new Date();
        tempDate.setHours(h, 0, 0, 0);
        const key = tempDate.toLocaleTimeString([], { hour: '2-digit' });
        grouped[key] = { label: key };
      }
    } else if (period === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        grouped[day] = { label: day };
      });
    } else if (period === 'monthly') {
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      for (let d = 1; d <= lastDay; d++) {
        const key = `${d}`;
        grouped[key] = { label: key };
      }
    } else if (period === 'yearly') {
      for (let m = 0; m < 12; m++) {
        const tempDate = new Date();
        tempDate.setMonth(m);
        const key = tempDate.toLocaleString('default', { month: 'short' });
        grouped[key] = { label: key };
      }
    }

    for (const l of current) {
      const key = groupKey(l);
      const cat = normalizeCat(l);
      if (!grouped[key]) grouped[key] = { label: key };
      grouped[key][cat] = (grouped[key][cat] ?? 0) + (l.calculatedEmissions ?? l.co2eKg ?? 0);
    }
    const stackedData  = Object.values(grouped);
    const trendData    = stackedData.map((row) => ({
      ...row,
      total: DEFAULT_SERIES.reduce((s, ser) => s + (row[ser.key] ?? 0), 0),
    }));

    /* 7-day trend (anchored to latest activity date if system date has no recent logs) */
    const latestLogDate = logs.reduce((latest, l) => {
      const d = parseDate(l);
      return !latest || d > latest ? d : latest;
    }, null);

    const anchorDate = (latestLogDate && (new Date() - latestLogDate) > 3 * 86_400_000)
      ? new Date(latestLogDate)
      : new Date();

    const sevenDaysAgo = new Date(anchorDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recent7 = logs.filter((l) => {
      const d = parseDate(l);
      return d >= sevenDaysAgo && d <= anchorDate;
    });
    
    const days7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() - i);
      const dayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      const dayDateStr = d.toISOString().split('T')[0];

      const prevD = new Date(d);
      prevD.setDate(prevD.getDate() - 7);
      const prevDayDateStr = prevD.toISOString().split('T')[0];

      const dayLogs = recent7.filter((l) => {
        const ld = parseDate(l);
        return ld && ld.toISOString().split('T')[0] === dayDateStr;
      });

      const prevDayLogs = logs.filter((l) => {
        const ld = parseDate(l);
        return ld && ld.toISOString().split('T')[0] === prevDayDateStr;
      });

      let currentSum = 0;
      for (const l of dayLogs) {
        currentSum += (l.calculatedEmissions ?? l.co2eKg ?? 0);
      }

      let prevSum = 0;
      for (const l of prevDayLogs) {
        prevSum += (l.calculatedEmissions ?? l.co2eKg ?? 0);
      }

      const dayObj = {
        day: dayLabel,
        currentWeek: Number(currentSum.toFixed(2)),
        previousWeek: Number(prevSum.toFixed(2)),
        transport: 0,
        energy: 0,
        food: 0,
        shopping: 0,
        other: 0,
      };

      for (const l of dayLogs) {
        const cat = normalizeCat(l);
        const value = l.calculatedEmissions ?? l.co2eKg ?? 0;
        if (cat in dayObj) {
          dayObj[cat] += value;
        } else {
          dayObj.other += value;
        }
      }
      days7.push(dayObj);
    }
    const weeklyTrendData = days7;

    /* Monthly comparison — last 6 months */
    const monthlyComp = [];
    for (let i = 5; i >= 0; i--) {
      const d   = new Date();
      d.setMonth(d.getMonth() - i);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const mLogs  = logs.filter((l) => inRange(l, mStart, mEnd));
      const emissions = sumEmissions(mLogs);
      monthlyComp.push({
        month: d.toLocaleString('default', { month: 'short' }),
        emissions: parseFloat(emissions.toFixed(2)),
        target: 150,
      });
    }

    /* Top activities */
    const topActivities = [...current]
      .sort((a, b) =>
        (b.calculatedEmissions ?? b.co2eKg ?? 0) - (a.calculatedEmissions ?? a.co2eKg ?? 0)
      )
      .slice(0, 5)
      .map((l, idx) => ({
        rank:      idx + 1,
        label:     l.activityLabel ?? l.activityType ?? 'Activity',
        emissions: l.calculatedEmissions ?? l.co2eKg ?? 0,
        category:  (l.category ?? 'other').toLowerCase(),
        icon:      CATEGORY_META[(l.category ?? '').toLowerCase()]?.emoji ?? '📊',
      }));

    return {
      totalNow,
      totalPrev,
      catData,
      topCat,
      stackedData,
      trendData,
      weeklyTrendData,
      monthlyComp,
      topActivities,
      entries: current.length,
      entriesPrev: prior.length,
      avgPerEntry: current.length > 0 ? totalNow / current.length : 0,
      avgPerEntryPrev: prior.length > 0 ? totalPrev / prior.length : 0,
    };
  }, [logs, period, t]);
}

/* ──────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────── */
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

function SummaryRow({ totalNow, totalPrev, topCat, avgPerEntry, avgPerEntryPrev, entries, entriesPrev, period, periodSub }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reportsPage.totalEmissions')}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
          {formatEmission(totalNow)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={totalNow} prev={totalPrev} />
          <span className="text-xs text-slate-400">{periodSub}</span>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reportsPage.topSource')}</p>
        {topCat ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl" aria-hidden="true">
              {CATEGORY_META[topCat.category]?.emoji ?? '📊'}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{topCat.name}</p>
              <p className="text-xs text-slate-400">
                {t('reportsPage.ofTotal', { pct: totalNow > 0 ? ((topCat.value / totalNow) * 100).toFixed(0) : 0 })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mt-2">—</p>
        )}
      </div>

      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reportsPage.avgActivity')}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
          {formatEmission(avgPerEntry)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={avgPerEntry} prev={avgPerEntryPrev} />
        </div>
      </div>

      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reportsPage.activities')}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {entries}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <DeltaBadge current={entries} prev={entriesPrev} />
          <span className="text-xs text-slate-400">{periodSub}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryBreakdown({ catData }) {
  const { t } = useTranslation();
  const total = catData.reduce((s, d) => s + d.value, 0);

  if (catData.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        {t('reportsPage.noDataPeriod')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-root">
        <thead className="table-head">
          <tr>
            <th className="table-th w-8">#</th>
            <th className="table-th">{t('reportsPage.colCategory')}</th>
            <th className="table-th text-right">{t('reportsPage.colCo2e')}</th>
            <th className="table-th text-right">{t('reportsPage.colShare')}</th>
            <th className="table-th text-right">{t('reportsPage.colVsPrior')}</th>
            <th className="table-th min-w-[120px]">{t('reportsPage.colDistribution')}</th>
          </tr>
        </thead>
        <tbody>
          {catData.map((row, i) => {
            const sharePct = total > 0 ? (row.value / total) * 100 : 0;
            const meta     = CATEGORY_META[row.category] ?? {};
            return (
              <tr key={row.category} className="table-row">
                <td className="table-td text-slate-400 font-mono text-xs">{i + 1}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden="true">{meta.emoji ?? '📊'}</span>
                    <Badge variant={CAT_BADGE[row.category] ?? 'slate'} size="sm">{row.name}</Badge>
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
                        style={{ width: `${sharePct}%`, background: meta.color ?? COLORS.green[500] }}
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
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 dark:border-slate-700">
            <td className="table-td" />
            <td className="table-td font-semibold text-slate-800 dark:text-slate-200">{t('reportsPage.colTotal')}</td>
            <td className="table-td text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatEmission(total)}
            </td>
            <td className="table-td text-right font-semibold text-slate-500">100%</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TopActivities({ activities }) {
  const { t } = useTranslation();
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        {t('reportsPage.noActivitiesLogged')}
      </div>
    );
  }
  const max = activities[0]?.emissions ?? 1;
  return (
    <ul className="space-y-3">
      {activities.map((a) => {
        const catLabel = CAT_KEY_MAP[a.category] ? t(CAT_KEY_MAP[a.category]) : (CATEGORY_META[a.category]?.label ?? a.category);
        return (
          <li key={a.rank} className="flex items-center gap-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              a.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
              a.rank === 2 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
              a.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>{a.rank}</span>
            <span className="text-lg leading-none shrink-0" aria-hidden="true">{a.icon}</span>
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
                  {catLabel}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const { t } = useTranslation();
  const { logs, isLoading, fetchLogs } = useActivity();
  const { user }    = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ecoScore, setEcoScore]     = useState(null);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    ecoScoreService.getEcoScore().then((r) => setEcoScore(r?.score ?? null)).catch(() => {});
  }, []);

  const periodTabs = useMemo(() => [
    { id: 'daily',   label: t('reportsPage.daily')   },
    { id: 'weekly',  label: t('reportsPage.weekly')  },
    { id: 'monthly', label: t('reportsPage.monthly') },
    { id: 'yearly',  label: t('reportsPage.yearly')  },
  ], [t]);

  const periodLabelMap = useMemo(() => ({
    daily:   t('reportsPage.dailySub'),
    weekly:  t('reportsPage.weeklySub'),
    monthly: t('reportsPage.monthlySub'),
    yearly:  t('reportsPage.yearlySub'),
  }), [t]);

  const periodNameMap = useMemo(() => ({
    daily:   t('reportsPage.daily'),
    weekly:  t('reportsPage.weekly'),
    monthly: t('reportsPage.monthly'),
    yearly:  t('reportsPage.yearly'),
  }), [t]);

  const trendSeriesTrans = useMemo(() => [
    { key: 'total', name: t('reportsPage.totalCo2e'), color: COLORS.green[500] },
  ], [t]);

  const {
    totalNow, totalPrev, catData, topCat,
    stackedData, trendData, weeklyTrendData, monthlyComp,
    topActivities, entries, entriesPrev, avgPerEntry, avgPerEntryPrev,
  } = useAnalytics(logs, period, t);

  const pieData = catData.map((c) => ({ name: c.name, value: c.value, category: c.category }));

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      const fileName = await generateMonthlyReport({
        username:       user?.username ?? user?.email ?? 'User',
        period,
        ecoScore,
        totalNow,
        topCat,
        avgPerEntry,
        entries,
        catData,
        topActivities,
        weeklyTrendData,
      });
      toast.success(t('reportsPage.reportDownloaded', { file: fileName }));
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error(t('reportsPage.pdfGenFailed'));
    } finally {
      setPdfLoading(false);
    }
  }, [user, period, ecoScore, totalNow, topCat, avgPerEntry, entries, catData, topActivities, weeklyTrendData, t]);

  const periodSub = periodLabelMap[period] ?? '';
  const periodName = periodNameMap[period] ?? period;

  return (
    <div className="space-y-6 fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('reportsPage.title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('reportsPage.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Tabs
            tabs={periodTabs}
            variant="pills"
            defaultTab="monthly"
            onChange={setPeriod}
          />
          <Button
            id="download-pdf-btn"
            variant="primary"
            size="sm"
            isLoading={pdfLoading}
            onClick={handleDownloadPdf}
            leftIcon={pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          >
            {pdfLoading ? t('reportsPage.generating') : t('reportsPage.downloadPdf')}
          </Button>
        </div>
      </div>

      {/* ── 1. Summary KPIs ────────────────────────────────── */}
      <SummaryRow
        totalNow={totalNow}
        totalPrev={totalPrev}
        topCat={topCat}
        avgPerEntry={avgPerEntry}
        avgPerEntryPrev={avgPerEntryPrev}
        entries={entries}
        entriesPrev={entriesPrev}
        period={period}
        periodSub={periodSub}
      />

      {/* ── 2. Stacked bar + Trend line ─────────────────────── */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <Card.Header
              title={t('reportsPage.periodEmissions', { period: periodName })}
              subtitle={t('reportsPage.stackedByCategory')}
            />
            {stackedData.length > 0
              ? <StackedBarChart data={stackedData} height={288} series={DEFAULT_SERIES} />
              : <div className="flex items-center justify-center h-72 text-sm text-slate-400">{t('reportsPage.noDataPeriod')}</div>
            }
          </Card>

          <Card>
            <Card.Header
              title={t('reportsPage.emissionsTrend')}
              subtitle={t('reportsPage.totalOverTime')}
              action={<Badge variant="green" dot size="sm">{t('reportsPage.live')}</Badge>}
            />
            {trendData.length > 0
              ? <TrendLineChart data={trendData} series={trendSeriesTrans} height={288} />
              : <div className="flex items-center justify-center h-72 text-sm text-slate-400">{t('reportsPage.noDataPeriod')}</div>
            }
          </Card>
        </div>

        {/* ── 3. Pie + Weekly Trend ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Card.Header
              title={t('reportsPage.categorySplit')}
              subtitle={t('reportsPage.proportionalBreakdown', { period: periodName })}
            />
            {pieData.length > 0
              ? <CategoryPieChart data={pieData} height={288} innerRadius={64} />
              : <div className="flex items-center justify-center h-72 text-sm text-slate-400">{t('reportsPage.noDataPeriod')}</div>
            }
          </Card>

          <Card>
            <Card.Header
              title={t('reportsPage.sevenDayTrend')}
              subtitle={t('reportsPage.dailyStackedByCategory')}
              action={<Badge variant="slate" size="sm">{t('reportsPage.last7Days')}</Badge>}
            />
            {weeklyTrendData.length > 0
              ? <WeeklyTrendChart data={weeklyTrendData} height={288} />
              : <div className="flex items-center justify-center h-72 text-sm text-slate-400">{t('reportsPage.noDataPeriod')}</div>
            }
          </Card>
        </div>
      </div>

      {/* ── 4. Monthly Comparison ──────────────────────────── */}
      <Card>
        <Card.Header
          title={t('reportsPage.monthlyComparison')}
          subtitle={t('reportsPage.monthlyComparisonSub')}
          action={
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 shrink-0" aria-hidden="true" />
                {t('reportsPage.actual')}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 shrink-0" aria-hidden="true" />
                {t('reportsPage.target')}
              </span>
            </div>
          }
        />
        <MonthlyComparisonChart data={monthlyComp} height={220} />
      </Card>

      {/* ── 5. Category breakdown + Top activities ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <Card.Header
            title={t('reportsPage.categoryBreakdown')}
            subtitle={t('reportsPage.categoryBreakdownSub', { period: periodName })}
          />
          <CategoryBreakdown catData={catData} />
        </Card>

        <Card>
          <Card.Header
            title={t('reportsPage.topActivities')}
            subtitle={t('reportsPage.topActivitiesSub')}
          />
          <TopActivities activities={topActivities} />
        </Card>
      </div>
    </div>
  );
}
