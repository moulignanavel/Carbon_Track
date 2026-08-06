import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, CalendarDays, Leaf, TrendingDown, TrendingUp } from 'lucide-react';

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
        No {label} is available for this month.
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
function Chart({ title, description, children, wide = false, reduceMotion }) {
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={`${card} ${wide ? 'xl:col-span-2' : ''}`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-2.5 h-52">{children}</div>
    </motion.section>
  );
}

export default function OrganisationMonthlyTrendsPage({ data, loading, error, onRetry }) {
  const reduceMotion = useReducedMotion(),
    source = data || EMPTY_DATA;
  const logs = useMemo(() => source.activityLogs || [], [source.activityLogs]);
  const employees = useMemo(() => source.employees || [], [source.employees]);
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
      if (!categoryDay.has(day)) categoryDay.set(day, { day });
      if (!departmentDay.has(day)) departmentDay.set(day, { day });
      categoryDay.get(day)[category] = (categoryDay.get(day)[category] || 0) + emission(row);
      departmentDay.get(day)[department] = (departmentDay.get(day)[department] || 0) + emission(row);
    });
    const days = [...byDay].sort(([a], [b]) => a - b).map(([day, value]) => ({ day, emissions: Number(value.toFixed(2)) }));
    const categories = [...new Set(selected.map((row) => row.category || 'Uncategorised'))],
      departments = [...new Set(selected.map((row) => employeeDepartment.get(row.employee) || 'Unassigned'))];
    const total = selected.reduce((sum, row) => sum + emission(row), 0),
      previousTotal = previous.reduce((sum, row) => sum + emission(row), 0),
      change = previousTotal ? ((total - previousTotal) * 100) / previousTotal : null;
    const categoryTotals = categories
      .map((name) => ({ name, value: selected.filter((row) => (row.category || 'Uncategorised') === name).reduce((sum, row) => sum + emission(row), 0) }))
      .sort((a, b) => b.value - a.value);
    const departmentTotals = departments
      .map((name) => ({ name, value: selected.filter((row) => (employeeDepartment.get(row.employee) || 'Unassigned') === name).reduce((sum, row) => sum + emission(row), 0) }))
      .sort((a, b) => a.value - b.value);
    return {
      days,
      categoryTrend: [...categoryDay.values()].sort((a, b) => a.day - b.day),
      departmentTrend: [...departmentDay.values()].sort((a, b) => a.day - b.day),
      categories,
      departments,
      total: Number(total.toFixed(2)),
      previousTotal: Number(previousTotal.toFixed(2)),
      change,
      highestCategory: categoryTotals[0],
      bestDepartment: departmentTotals[0],
    };
  }, [selected, previous, employees]);
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
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleString('en', { month: 'long' }),
    improved = derived.change !== null && derived.change < 0,
    TrendIcon = improved ? TrendingDown : TrendingUp;
  return (
    <div className="space-y-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Organisation intelligence</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Monthly Trends</h1>
        <p className="mt-0.5 text-xs text-slate-500">Review verified organisation emissions for a selected reporting month.</p>
      </header>
      <section className={card} aria-label="Monthly trend filters">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Month</span>
            <select aria-label="Reporting month" className={`${select} w-full`} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, month) => (
                <option key={month} value={month}>
                  {new Date(2020, month, 1).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Year</span>
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
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total monthly emissions</p>
          <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
            {derived.total.toLocaleString()} <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">{selected.length} verified activities</p>
        </motion.article>
        <motion.article initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Previous-month comparison</p>
          {derived.change === null ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">Previous month has no emissions data</p>
          ) : (
            <p className={`mt-2 flex items-center gap-1.5 text-lg font-black ${improved ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendIcon className="h-4 w-4" />
              {Math.abs(derived.change).toFixed(1)}% {improved ? 'lower' : 'higher'}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-slate-400">Previous total: {derived.previousTotal.toLocaleString()} kg CO₂e</p>
        </motion.article>
      </section>
      {!selected.length && (
        <section className={`${card} border-dashed text-center`}>
          <Empty label="verified activity data" />
        </section>
      )}
      <div className="grid gap-3.5 xl:grid-cols-2">
        <Chart title="Monthly Line Chart" description="Daily emissions within the selected month" wide reduceMotion={reduceMotion}>
          {derived.days.length ? (
            <ResponsiveContainer>
              <AreaChart data={derived.days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" label={{ value: 'Day of month', position: 'insideBottom', offset: -4, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={42} />
                <Tooltip />
                <Area type="monotone" dataKey="emissions" stroke="#059669" fill="#d1fae5" isAnimationActive={!reduceMotion} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="daily emissions" />
          )}
        </Chart>
        <Chart title="Category Trend Chart" description="Daily emissions split by real activity categories" reduceMotion={reduceMotion}>
          {derived.categoryTrend.length ? (
            <ResponsiveContainer>
              <LineChart data={derived.categoryTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={42} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                {derived.categories.map((name, index) => (
                  <Line key={name} name={name} dataKey={name} stroke={palette[index % palette.length]} dot={false} isAnimationActive={!reduceMotion} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="category trend data" />
          )}
        </Chart>
        <Chart title="Department Trend Chart" description="Daily emissions split by employee department" reduceMotion={reduceMotion}>
          {derived.departmentTrend.length ? (
            <ResponsiveContainer>
              <LineChart data={derived.departmentTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={42} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                {derived.departments.map((name, index) => (
                  <Line key={name} name={name} dataKey={name} stroke={palette[index % palette.length]} dot={false} isAnimationActive={!reduceMotion} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="department trend data" />
          )}
        </Chart>
      </div>
      <section className={card}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Monthly Insights</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            ['Highest emission category', derived.highestCategory?.name, derived.highestCategory && `${derived.highestCategory.value.toLocaleString()} kg CO₂e`],
            ['Best-performing department', derived.bestDepartment?.name, derived.bestDepartment && `${derived.bestDepartment.value.toLocaleString()} kg CO₂e`],
            ['Recorded activity volume', selected.length.toLocaleString(), 'Verified activities in this month'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{value || 'Not available'}</p>
              {note && <p className="mt-0.5 text-[10px] text-slate-400">{note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
