import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, CalendarDays, BarChart2, PieChart as PieIcon, Layers, Leaf, TrendingDown, TrendingUp, Trophy } from 'lucide-react';

const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const select = 'h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const palette = ['#059669', '#3b82f6', '#f59e0b', '#0f766e', '#64748b', '#84cc16'];
const EMPTY_DATA = {};
const safeDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const emission = (row) => Number(row.emission || 0);

function Empty({ label }) {
  return (
    <div className="grid h-full min-h-40 place-items-center text-center text-xs text-slate-500">
      <div>
        <Leaf className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
        {label}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading monthly trends">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-3.5 xl:grid-cols-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

function Chart({ title, description, action, children, wide = false, reduceMotion }) {
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={`${card} ${wide ? 'xl:col-span-2' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800/80">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="mt-3 h-80 sm:h-84">{children}</div>
    </motion.section>
  );
}

function MonthlyTrendsTooltip({ active, payload, label, selectedYear, selectedMonth, type }) {
  const { t, i18n } = useTranslation();
  if (!active || !payload?.length) return null;
  const langLocale = i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US';

  let titleHeader = String(label || '');
  if (type === 'cumulative' || type === 'category' || type === 'department') {
    const dayNum = Number(label);
    if (!Number.isNaN(dayNum)) {
      const dateObj = new Date(selectedYear, selectedMonth, dayNum);
      titleHeader = !Number.isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(langLocale, { day: 'numeric', month: 'long', year: 'numeric' })
        : `${t('orgDash.day', { defaultValue: 'Day' })} ${dayNum}`;
    }
  }

  const nonZero = payload.filter((e) => Number(e.value) > 0);
  const displayPayload = nonZero.length ? nonZero : payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 z-50 min-w-48">
      <p className="mb-1.5 font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
        {titleHeader}
      </p>
      {displayPayload.map((entry) => {
        const rawName = entry.name;
        const displayName = type === 'category'
          ? t(`categories.${rawName.toLowerCase()}`, { defaultValue: rawName })
          : type === 'department'
          ? t(`departments.${rawName}`, { defaultValue: rawName })
          : rawName;
        return (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color || entry.fill }} />
              {displayName}
            </span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrganisationMonthlyTrendsPage({ data, loading, error, onRetry }) {
  const reduceMotion = useReducedMotion();
  const { t, i18n } = useTranslation();
  const source = data || EMPTY_DATA;
  const logs = useMemo(() => source.activityLogs || [], [source.activityLogs]);
  const employees = useMemo(() => source.employees || [], [source.employees]);

  const [categoryMode, setCategoryMode] = useState('weekly'); // 'weekly' | 'donut' | 'daily'
  const [deptMode, setDeptMode] = useState('weekly'); // 'weekly' | 'ranking' | 'daily'

  const available = useMemo(
    () =>
      [
        ...new Set(
          logs
            .map((row) => {
              const date = safeDate(row.date);
              return date ? `${date.getFullYear()}-${date.getMonth()}` : null;
            })
            .filter(Boolean)
        ),
      ].sort(),
    [logs]
  );

  const latest = available.at(-1);
  const current = new Date();
  const [selectedYear, setSelectedYear] = useState(() => (latest ? Number(latest.split('-')[0]) : current.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(() => (latest ? Number(latest.split('-')[1]) : current.getMonth()));
  const years = useMemo(() => [...new Set(available.map((value) => Number(value.split('-')[0])))].sort((a, b) => b - a), [available]);

  const selected = useMemo(
    () =>
      logs.filter((row) => {
        const date = safeDate(row.date);
        return date && date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
      }),
    [logs, selectedYear, selectedMonth]
  );

  const previousDate = useMemo(() => new Date(selectedYear, selectedMonth - 1, 1), [selectedYear, selectedMonth]),
    previous = useMemo(
      () =>
        logs.filter((row) => {
          const date = safeDate(row.date);
          return date && date.getFullYear() === previousDate.getFullYear() && date.getMonth() === previousDate.getMonth();
        }),
      [logs, previousDate]
    );

  const derived = useMemo(() => {
    const byDay = new Map(),
      categoryDay = new Map(),
      departmentDay = new Map(),
      employeeDepartment = new Map(employees.map((row) => [row.name, row.department || 'Unassigned']));

    selected.forEach((row) => {
      const date = safeDate(row.date),
        day = date?.getDate();
      if (!day) return;
      byDay.set(day, (byDay.get(day) || 0) + emission(row));
      const category = row.category || 'Uncategorised',
        department = employeeDepartment.get(row.employee) || 'Unassigned';

      if (!categoryDay.has(day)) categoryDay.set(day, {});
      if (!departmentDay.has(day)) departmentDay.set(day, {});

      categoryDay.get(day)[category] = (categoryDay.get(day)[category] || 0) + emission(row);
      departmentDay.get(day)[department] = (departmentDay.get(day)[department] || 0) + emission(row);
    });

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    let runningCumulative = 0;
    const days = [];
    const categories = [...new Set(selected.map((row) => row.category || 'Uncategorised'))];
    const departments = [...new Set(selected.map((row) => employeeDepartment.get(row.employee) || 'Unassigned'))];

    const categoryTrend = [];
    const departmentTrend = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEmissions = Number((byDay.get(d) || 0).toFixed(2));
      runningCumulative += dayEmissions;
      days.push({
        day: d,
        emissions: dayEmissions,
        cumulativeEmissions: Number(runningCumulative.toFixed(2)),
      });

      const catObj = { day: d };
      categories.forEach((cat) => {
        catObj[cat] = Number(((categoryDay.get(d) && categoryDay.get(d)[cat]) || 0).toFixed(2));
      });
      categoryTrend.push(catObj);

      const deptObj = { day: d };
      departments.forEach((dept) => {
        deptObj[dept] = Number(((departmentDay.get(d) && departmentDay.get(d)[dept]) || 0).toFixed(2));
      });
      departmentTrend.push(deptObj);
    }

    // Weekly Breakdown (4 Weeks: W1, W2, W3, W4)
    const weekRanges = [
      { key: 'W1', name: `${t('orgDash.week', { defaultValue: 'Week' })} 1 (${t('orgDash.days', { defaultValue: 'Days' })} 1-7)`, start: 1, end: 7 },
      { key: 'W2', name: `${t('orgDash.week', { defaultValue: 'Week' })} 2 (${t('orgDash.days', { defaultValue: 'Days' })} 8-14)`, start: 8, end: 14 },
      { key: 'W3', name: `${t('orgDash.week', { defaultValue: 'Week' })} 3 (${t('orgDash.days', { defaultValue: 'Days' })} 15-21)`, start: 15, end: 21 },
      { key: 'W4', name: `${t('orgDash.week', { defaultValue: 'Week' })} 4 (${t('orgDash.days', { defaultValue: 'Days' })} 22-${daysInMonth})`, start: 22, end: daysInMonth },
    ];

    const weeklyCategoryTrend = weekRanges.map((w) => {
      const row = { week: w.name, weekKey: w.key };
      categories.forEach((cat) => {
        let sum = 0;
        for (let d = w.start; d <= w.end; d++) {
          sum += (categoryDay.get(d) && categoryDay.get(d)[cat]) || 0;
        }
        row[cat] = Number(sum.toFixed(2));
      });
      return row;
    });

    const weeklyDepartmentTrend = weekRanges.map((w) => {
      const row = { week: w.name, weekKey: w.key };
      departments.forEach((dept) => {
        let sum = 0;
        for (let d = w.start; d <= w.end; d++) {
          sum += (departmentDay.get(d) && departmentDay.get(d)[dept]) || 0;
        }
        row[dept] = Number(sum.toFixed(2));
      });
      return row;
    });

    const total = selected.reduce((sum, row) => sum + emission(row), 0),
      previousTotal = previous.reduce((sum, row) => sum + emission(row), 0),
      change = previousTotal ? ((total - previousTotal) * 100) / previousTotal : null;

    const categoryTotals = categories
      .map((name) => {
        const val = selected.filter((row) => (row.category || 'Uncategorised') === name).reduce((sum, row) => sum + emission(row), 0);
        return {
          name,
          displayName: t(`categories.${name.toLowerCase()}`, { defaultValue: name }),
          value: Number(val.toFixed(2)),
          percentage: total > 0 ? Number(((val * 100) / total).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const departmentTotals = departments
      .map((name) => {
        const val = selected.filter((row) => (employeeDepartment.get(row.employee) || 'Unassigned') === name).reduce((sum, row) => sum + emission(row), 0);
        return {
          name,
          displayName: t(`departments.${name}`, { defaultValue: name }),
          value: Number(val.toFixed(2)),
          percentage: total > 0 ? Number(((val * 100) / total).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return {
      days,
      categoryTrend,
      departmentTrend,
      weeklyCategoryTrend,
      weeklyDepartmentTrend,
      categories,
      departments,
      categoryTotals,
      departmentTotals,
      total: Number(total.toFixed(2)),
      previousTotal: Number(previousTotal.toFixed(2)),
      change,
      highestCategory: categoryTotals[0],
      bestDepartment: departmentTotals.at(-1), // Lowest emissions
    };
  }, [selected, previous, employees, selectedYear, selectedMonth, t]);

  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} border-rose-200 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Monthly trends could not be loaded</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            Retry
          </button>
        </div>
      </section>
    );

  const langLocale = i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US';
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(langLocale, { month: 'long' }),
    improved = derived.change !== null && derived.change < 0,
    TrendIcon = improved ? TrendingDown : TrendingUp;

  return (
    <div className="space-y-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">{t('orgNav.intelligence', 'Organisation intelligence')}</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">{t('orgNav.monthlyTrends', 'Monthly Trends')}</h1>
        <p className="mt-0.5 text-xs text-slate-500">{t('orgNav.monthlyTrendsDesc', 'Review verified organisation emissions for a selected reporting month.')}</p>
      </header>

      <section className={card} aria-label={t('orgDash.monthlyTrendFilters', 'Monthly trend filters')}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgDash.month', 'Month')}</span>
            <select aria-label="Reporting month" className={`${select} w-full`} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, month) => (
                <option key={month} value={month}>
                  {new Date(2020, month, 1).toLocaleDateString(langLocale, { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgDash.year', 'Year')}</span>
            <select aria-label="Reporting year" className={`${select} w-full`} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {(years.length ? years : [selectedYear]).map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
          <div className="flex h-9 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <CalendarDays className="h-3.5 w-3.5" />
            {monthName} {selectedYear}
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        <motion.article initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{t('orgDash.totalMonthlyEmissions', 'Total Monthly Emissions')}</p>
          <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
            {derived.total.toLocaleString()} <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">{selected.length} {t('orgDash.verifiedActivities', 'verified activities')}</p>
        </motion.article>
        <motion.article initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{t('orgDash.previousMonthComparison', 'Previous-Month Comparison')}</p>
          {derived.change === null ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">{t('orgDash.previousMonthNoData', 'Previous month has no emissions data')}</p>
          ) : (
            <p className={`mt-2 flex items-center gap-1.5 text-lg font-black ${improved ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendIcon className="h-4 w-4" />
              {Math.abs(derived.change).toFixed(1)}% {improved ? t('common.lower', 'lower') : t('common.higher', 'higher')}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-slate-400">{t('orgDash.previousTotal', 'Previous total')}: {derived.previousTotal.toLocaleString()} kg CO₂e</p>
        </motion.article>
      </section>

      {!selected.length && (
        <section className={`${card} border-dashed text-center`}>
          <Empty label={t('orgDash.noVerifiedActivity', 'No verified activity data is available for this month.')} />
        </section>
      )}

      {/* Main Charts Grid */}
      <div className="grid gap-3.5 xl:grid-cols-2">
        {/* 1. Monthly Cumulative Footprint Curve */}
        <Chart
          title={t('orgDash.monthlyLineChart', 'Monthly Emissions Trend')}
          description={t('orgDash.dailyEmissionsInMonth', 'Cumulative footprint curve across the month')}
          wide
          reduceMotion={reduceMotion}
        >
          {derived.total > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={derived.days} margin={{ top: 12, right: 16, bottom: 20, left: 6 }}>
                <defs>
                  <linearGradient id="monthCumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" label={{ value: t('orgDash.dayOfMonth', 'Day of month'), position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip content={<MonthlyTrendsTooltip selectedYear={selectedYear} selectedMonth={selectedMonth} type="cumulative" />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                <Area type="monotone" name={t('orgDash.cumulativeFootprintLegend', 'Cumulative Monthly Footprint (kg CO₂e)')} dataKey="cumulativeEmissions" stroke="#059669" strokeWidth={2.5} fill="url(#monthCumGradient)" isAnimationActive={!reduceMotion} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty label={t('orgDash.noDailyEmissions', 'No daily emissions are available for this month.')} />
          )}
        </Chart>

        {/* 2. Category Trend & Distribution Card */}
        <Chart
          title={t('orgDash.categoryTrendChart', 'Category Analysis')}
          description={t('orgDash.dailyEmissionsByCategory', 'Breakdown of carbon emissions by activity category')}
          reduceMotion={reduceMotion}
          action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setCategoryMode('weekly')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${categoryMode === 'weekly' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <BarChart2 className="h-3 w-3" />
                {t('orgNav.weekly', { defaultValue: 'Weekly' })}
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode('donut')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${categoryMode === 'donut' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <PieIcon className="h-3 w-3" />
                {t('orgNav.share', { defaultValue: 'Share' })}
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode('daily')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${categoryMode === 'daily' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Layers className="h-3 w-3" />
                {t('orgNav.daily', { defaultValue: 'Daily' })}
              </button>
            </div>
          }
        >
          {derived.categories.length ? (
            categoryMode === 'weekly' ? (
              <ResponsiveContainer>
                <BarChart data={derived.weeklyCategoryTrend} margin={{ top: 12, right: 16, bottom: 20, left: 6 }} barGap={4} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 10 }} width={48} />
                  <Tooltip content={<MonthlyTrendsTooltip selectedYear={selectedYear} selectedMonth={selectedMonth} type="category" />} cursor={{ fill: 'rgba(5, 150, 105, 0.05)', rx: 4 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                  {derived.categories.map((name, index) => (
                    <Bar key={name} name={t(`categories.${name.toLowerCase()}`, { defaultValue: name })} dataKey={name} fill={palette[index % palette.length]} maxBarSize={32} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : categoryMode === 'donut' ? (
              <div className="grid h-full items-center gap-4 sm:grid-cols-2">
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={derived.categoryTotals} dataKey="value" nameKey="displayName" innerRadius="55%" outerRadius="82%" paddingAngle={3} isAnimationActive={!reduceMotion}>
                        {derived.categoryTotals.map((row, index) => (
                          <Cell key={row.name} fill={palette[index % palette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${Number(value).toLocaleString()} kg CO₂e`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 overflow-y-auto pr-1">
                  {derived.categoryTotals.map((cat, index) => (
                    <div key={cat.name} className="rounded-lg border border-slate-100 p-2 dark:border-slate-800/80">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: palette[index % palette.length] }} />
                          {cat.displayName}
                        </span>
                        <span className="font-extrabold text-slate-950 dark:text-white tabular-nums">{cat.value.toLocaleString()} kg</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%`, background: palette[index % palette.length] }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{cat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={derived.categoryTrend} margin={{ top: 12, right: 16, bottom: 20, left: 6 }} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" label={{ value: t('orgDash.dayOfMonth', 'Day of month'), position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={48} />
                  <Tooltip content={<MonthlyTrendsTooltip selectedYear={selectedYear} selectedMonth={selectedMonth} type="category" />} cursor={{ fill: 'rgba(5, 150, 105, 0.05)', rx: 4 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                  {derived.categories.map((name, index) => (
                    <Bar key={name} name={t(`categories.${name.toLowerCase()}`, { defaultValue: name })} dataKey={name} fill={palette[index % palette.length]} maxBarSize={16} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <Empty label={t('orgDash.noCategoryTrendData', 'No category trend data is available for this month.')} />
          )}
        </Chart>

        {/* 3. Department Trend & Ranking Card */}
        <Chart
          title={t('orgDash.departmentTrendChart', 'Department Analysis')}
          description={t('orgDash.dailyEmissionsByDept', 'Emissions breakdown across employee departments')}
          reduceMotion={reduceMotion}
          action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setDeptMode('weekly')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${deptMode === 'weekly' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <BarChart2 className="h-3 w-3" />
                {t('orgNav.weekly', { defaultValue: 'Weekly' })}
              </button>
              <button
                type="button"
                onClick={() => setDeptMode('ranking')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${deptMode === 'ranking' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Trophy className="h-3 w-3" />
                {t('orgNav.ranking', { defaultValue: 'Ranking' })}
              </button>
              <button
                type="button"
                onClick={() => setDeptMode('daily')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${deptMode === 'daily' ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Layers className="h-3 w-3" />
                {t('orgNav.daily', { defaultValue: 'Daily' })}
              </button>
            </div>
          }
        >
          {derived.departments.length ? (
            deptMode === 'weekly' ? (
              <ResponsiveContainer>
                <BarChart data={derived.weeklyDepartmentTrend} margin={{ top: 12, right: 16, bottom: 20, left: 6 }} barGap={4} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 10 }} width={48} />
                  <Tooltip content={<MonthlyTrendsTooltip selectedYear={selectedYear} selectedMonth={selectedMonth} type="department" />} cursor={{ fill: 'rgba(5, 150, 105, 0.05)', rx: 4 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                  {derived.departments.map((name, index) => (
                    <Bar key={name} name={t(`departments.${name}`, { defaultValue: name })} dataKey={name} fill={palette[index % palette.length]} maxBarSize={32} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : deptMode === 'ranking' ? (
              <div className="h-full space-y-2 overflow-y-auto pr-1">
                {derived.departmentTotals.map((dept, index) => (
                  <div key={dept.name} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800/80">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          #{index + 1}
                        </span>
                        {dept.displayName}
                      </span>
                      <span className="font-extrabold text-slate-950 dark:text-white tabular-nums">{dept.value.toLocaleString()} kg CO₂e</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${dept.percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{dept.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={derived.departmentTrend} margin={{ top: 12, right: 16, bottom: 20, left: 6 }} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" label={{ value: t('orgDash.dayOfMonth', 'Day of month'), position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={48} />
                  <Tooltip content={<MonthlyTrendsTooltip selectedYear={selectedYear} selectedMonth={selectedMonth} type="department" />} cursor={{ fill: 'rgba(5, 150, 105, 0.05)', rx: 4 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                  {derived.departments.map((name, index) => (
                    <Bar key={name} name={t(`departments.${name}`, { defaultValue: name })} dataKey={name} fill={palette[index % palette.length]} maxBarSize={16} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <Empty label={t('orgDash.noDepartmentTrendData', 'No department trend data is available for this month.')} />
          )}
        </Chart>
      </div>

      <section className={card}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{t('orgDash.monthlyInsights', 'Monthly Insights')}</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            [t('orgDash.highestEmissionCategory', 'Highest emission category'), derived.highestCategory && t(`categories.${derived.highestCategory.name.toLowerCase()}`, { defaultValue: derived.highestCategory.name }), derived.highestCategory && `${derived.highestCategory.value.toLocaleString()} kg CO₂e`],
            [t('orgDash.bestPerformingDept', 'Best performing department'), derived.bestDepartment?.name && t(`departments.${derived.bestDepartment.name}`, { defaultValue: derived.bestDepartment.name }), derived.bestDepartment && `${derived.bestDepartment.value.toLocaleString()} kg CO₂e`],
            [t('orgDash.recordedActivityVolume', 'Recorded activity volume'), selected.length.toLocaleString(), t('orgDash.verifiedActivitiesInMonth', 'Verified activities in this month')],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{value || t('orgDash.notAvailable', 'Not available')}</p>
              {note && <p className="mt-0.5 text-[10px] text-slate-400">{note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
