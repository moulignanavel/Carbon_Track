import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, Leaf } from 'lucide-react';
import EcoLottie from '@/components/organisation/EcoLottie';

const FILTER_KEY='carbontrack.organisation.analytics.filters';
const EMPTY_ANALYTICS_DATA={};
const palette=['#059669','#0f766e','#3b82f6','#f59e0b','#64748b','#84cc16'];
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const select = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const emptyAnimation = () => import('@/assets/animations/eco-empty.json');

function EmptyIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <circle cx="60" cy="60" r="43" fill="#ecfdf5" />
      <path d="M60 88V52M58 69c-18 0-27-9-27-23 16-1 27 7 27 23Zm4-12c16-1 25-9 25-22-16 0-25 8-25 22Z" fill="#4ade80" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
function Empty({ label }) {
  return (
    <div className="grid h-full min-h-40 place-items-center text-center text-xs text-slate-500">
      <div>
        <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <Leaf className="h-4 w-4 text-emerald-600" />
        </span>
        No {label} available for these filters.
      </div>
    </div>
  );
}
function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading analytics">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-3.5 xl:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
function ChartCard({ title, description, summary, children, reduceMotion }) {
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={card}
      aria-labelledby={`${title.replaceAll(' ', '-')}-title`}
    >
      <h2 id={`${title.replaceAll(' ', '-')}-title`} className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-2.5 h-52">{children}</div>
      <p className="sr-only">{summary}</p>
    </motion.section>
  );
}
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-800 dark:text-white">
        {label || payload[0]?.payload?.category || payload[0]?.payload?.department || payload[0]?.payload?.employee}
      </p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex justify-between gap-4 text-slate-500">
          <span>{item.name}</span>
          <strong className="text-slate-900 dark:text-white">
            {Number(item.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            {item.dataKey === 'rate' ? '%' : ' kg CO₂e'}
          </strong>
        </p>
      ))}
    </div>
  );
}
const monthKey = (row) => {
  const date = new Date(`${row.date}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key) => {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en', { month: 'short', year: '2-digit' });
};
const startFor = (range) => {
  const now = new Date(),
    start = new Date(now);
  if (range === 'month') start.setDate(1);
  if (range === 'quarter') start.setMonth(start.getMonth() - 2, 1);
  if (range === 'year') start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

export default function OrganisationAnalyticsPage({ data = {}, loading = false, error = '', onRetry }) {
  const reduceMotion = useReducedMotion();
  const source = data || EMPTY_ANALYTICS_DATA;
  const stored = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(FILTER_KEY) || '{}');
    } catch {
      return {};
    }
  }, []);
  const [range, setRange] = useState(stored.range || 'all');
  const [department, setDepartment] = useState(stored.department || '');
  const [category, setCategory] = useState(stored.category || '');
  useEffect(() => {
    sessionStorage.setItem(FILTER_KEY, JSON.stringify({ range, department, category }));
  }, [range, department, category]);
  const employees = useMemo(() => source.employees || [], [source.employees]);
  const logs = useMemo(() => source.activityLogs || [], [source.activityLogs]);
  const goals = useMemo(() => source.goals || [], [source.goals]);
  const departments = useMemo(() => [...new Set(employees.map((row) => row.department).filter(Boolean))].sort(), [employees]);
  const categories = useMemo(() => [...new Set(logs.map((row) => row.category).filter(Boolean))].sort(), [logs]);
  useEffect(() => {
    if (department && !departments.includes(department)) setDepartment('');
    if (category && !categories.includes(category)) setCategory('');
  }, [department, category, departments, categories]);
  const filtered = useMemo(() => {
    const employeeDepartments = new Map(employees.map((row) => [row.name, row.department])),
      start = startFor(range),
      now = new Date();
    return logs.filter((row) => {
      const date = new Date(`${row.date}T00:00:00`);
      return (
        (range === 'all' || (!Number.isNaN(date.getTime()) && date >= start && date <= now)) &&
        (!department || employeeDepartments.get(row.employee) === department) &&
        (!category || row.category === category)
      );
    });
  }, [logs, employees, range, department, category]);
  const result = useMemo(() => {
    const employeeDepartments = new Map(employees.map((row) => [row.name, row.department])),
      ordered = [...filtered].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const emissions = (key, name) =>
      [
        ...ordered.reduce((map, row) => {
          const label = key(row);
          if (label) map.set(label, (map.get(label) || 0) + Number(row.emission || 0));
          return map;
        }, new Map()),
      ].map(([label, value]) => ({ [name]: label, emissions: Number(value.toFixed(2)) }));
    const trend = emissions(monthKey, 'period').map((row) => ({ ...row, period: monthLabel(row.period) }));
    const categoryRows = emissions((row) => row.category, 'category'),
      departmentRows = emissions((row) => employeeDepartments.get(row.employee) || 'Unassigned', 'department');
    const employeeRows = emissions((row) => row.employee || 'Unknown', 'employee')
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 12);
    const eligible = employees.filter((row) => !department || row.department === department),
      participants = new Set(filtered.map((row) => row.employee).filter(Boolean));
    const participation = [
      ...ordered.reduce((map, row) => {
        const key = monthKey(row);
        if (key) {
          if (!map.has(key)) map.set(key, new Set());
          if (row.employee) map.get(key).add(row.employee);
        }
        return map;
      }, new Map()),
    ].map(([key, names]) => ({ period: monthLabel(key), rate: eligible.length ? Number(((names.size * 100) / eligible.length).toFixed(1)) : 0 }));
    const rangedGoals = goals.filter((goal) => {
      if (range === 'all') return true;
      const date = new Date(`${goal.endDate || goal.startDate}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date >= startFor(range) && date <= new Date();
    });
    const goalTrend = [
      ...rangedGoals.reduce((map, goal) => {
        const date = new Date(`${goal.endDate || goal.startDate}T00:00:00`);
        if (Number.isNaN(date.getTime())) return map;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          value = map.get(key) || { total: 0, done: 0 };
        value.total++;
        if (['ACHIEVED', 'COMPLETED'].includes(String(goal.status).toUpperCase())) value.done++;
        map.set(key, value);
        return map;
      }, new Map()),
    ]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ period: monthLabel(key), rate: Number(((value.done * 100) / value.total).toFixed(1)) }));
    const total = filtered.reduce((sum, row) => sum + Number(row.emission || 0), 0);
    return {
      trend,
      categoryRows,
      departmentRows,
      employeeRows,
      participation,
      goalTrend,
      total: Number(total.toFixed(2)),
      average: filtered.length ? Number((total / filtered.length).toFixed(2)) : null,
      participants: participants.size,
      eligible: eligible.length,
      participationRate: eligible.length ? Number(((participants.size * 100) / eligible.length).toFixed(1)) : null,
    };
  }, [employees, filtered, goals, department, range]);
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-300`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Analytics could not be loaded</h1>
            <p className="mt-1 text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold">
            Retry
          </button>
        </div>
      </section>
    );
  const highest = [...result.categoryRows].sort((a, b) => b.emissions - a.emissions)[0],
    best = [...result.departmentRows].sort((a, b) => a.emissions - b.emissions)[0],
    latestParticipation = result.participation.at(-1),
    latestGoal = result.goalTrend.at(-1),
    animate = !reduceMotion;
  const kpis = [
    ['Filtered emissions', `${result.total.toLocaleString()} kg CO₂e`, `${filtered.length.toLocaleString()} verified activities`],
    ['Average per activity', result.average === null ? 'Not available' : `${result.average.toLocaleString()} kg CO₂e`, 'Matching activity average'],
    ['Active participants', result.participants.toLocaleString(), `${result.eligible.toLocaleString()} eligible employees`],
    ['Participation rate', result.participationRate === null ? 'Not available' : `${result.participationRate}%`, 'Selected filter result'],
  ];
  return (
    <div className="space-y-4">
      <motion.header initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Organisation intelligence</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Analytics</h1>
        <p className="mt-0.5 max-w-2xl text-xs text-slate-500">Explore verified emissions, employee participation and goal performance using live organisation data.</p>
      </motion.header>
      <section className={card} aria-label="Analytics filters">
        <div className="grid gap-2.5 md:grid-cols-3">
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Date range</span>
            <select aria-label="Analytics date range" className={select} value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="all">All available dates</option>
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
              <option value="year">This year</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Department</span>
            <select aria-label="Analytics department" className={select} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Category</span>
            <select aria-label="Analytics category" className={select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800">
          <span aria-live="polite">Showing {filtered.length.toLocaleString()} matching activities</span>
          {(range !== 'all' || department || category) && (
            <button
              type="button"
              onClick={() => {
                setRange('all');
                setDepartment('');
                setCategory('');
              }}
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>
    <section aria-label="Analytics summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(([label,value,note],index)=><motion.article key={label} initial={reduceMotion?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.35,delay:index*.04}} className={card}><p className="text-xs font-semibold uppercase tracking-[.08em] text-slate-500">{label}</p><p className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></motion.article>)}</section>
    {!filtered.length&&<section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-7 text-center dark:border-emerald-900 dark:bg-emerald-950/20"><EcoLottie animationData={emptyAnimation} loop={false} className="mx-auto h-28 w-28" fallback={<EmptyIcon/>} reducedMotionFallback={<EmptyIcon/>}/><h2 className="mt-2 font-semibold text-slate-900 dark:text-white">No analytics match these filters</h2><p className="mt-1 text-sm text-slate-500">Choose another date range, department, or category.</p></section>}
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Overall Emission Trend" description="Emissions grouped by reporting month" summary={result.trend.length?`${result.trend.length} periods displayed.`:'No trend data.'} reduceMotion={reduceMotion}>{result.trend.length?<ResponsiveContainer><AreaChart data={result.trend}><defs><linearGradient id="analyticsEmission" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#059669" stopOpacity=".3"/><stop offset="1" stopColor="#059669" stopOpacity=".02"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="period"/><YAxis width={52}/><Tooltip content={<Tip/>}/><Area name="Emissions" type="monotone" dataKey="emissions" stroke="#059669" strokeWidth={2.5} fill="url(#analyticsEmission)" isAnimationActive={animate}/></AreaChart></ResponsiveContainer>:<Empty label="emission trend data"/>}</ChartCard>
      <ChartCard title="Category Distribution" description="Share of matching emissions by category" summary={highest?`${highest.category} is highest.`:'No category data.'} reduceMotion={reduceMotion}>{result.categoryRows.length?<ResponsiveContainer><PieChart><Pie data={result.categoryRows} dataKey="emissions" nameKey="category" innerRadius="50%" outerRadius="76%" paddingAngle={2} isAnimationActive={animate}>{result.categoryRows.map((row,index)=><Cell key={row.category} fill={palette[index%palette.length]}/>)}</Pie><Tooltip content={<Tip/>}/><Legend iconType="circle"/></PieChart></ResponsiveContainer>:<Empty label="category distribution data"/>}</ChartCard>
      <ChartCard title="Department Comparison" description="Matching emissions by department" summary={best?`${best.department} has the lowest emissions.`:'No department data.'} reduceMotion={reduceMotion}>{result.departmentRows.length?<ResponsiveContainer><BarChart data={result.departmentRows} layout="vertical" margin={{left:8,right:16}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number"/><YAxis type="category" dataKey="department" width={100}/><Tooltip content={<Tip/>}/><Bar name="Emissions" dataKey="emissions" fill="#0f766e" radius={[0,6,6,0]} isAnimationActive={animate}/></BarChart></ResponsiveContainer>:<Empty label="department comparison data"/>}</ChartCard>
      <ChartCard title="Employee Performance Distribution" description="Employee emissions for the selected filters" summary={`${result.employeeRows.length} employees displayed.`} reduceMotion={reduceMotion}>{result.employeeRows.length?<ResponsiveContainer><BarChart data={result.employeeRows} margin={{bottom:44}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="employee" angle={-28} textAnchor="end" interval={0} height={66}/><YAxis/><Tooltip content={<Tip/>}/><Bar name="Emissions" dataKey="emissions" fill="#3b82f6" radius={[6,6,0,0]} isAnimationActive={animate}/></BarChart></ResponsiveContainer>:<Empty label="employee performance data"/>}</ChartCard>
      <ChartCard title="Participation Trend" description="Unique participating employees by month" summary={latestParticipation?`Latest participation is ${latestParticipation.rate} percent.`:'No participation data.'} reduceMotion={reduceMotion}>{result.participation.length?<ResponsiveContainer><LineChart data={result.participation}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="period"/><YAxis domain={[0,100]} width={46}/><Tooltip content={<Tip/>}/><Line name="Participation" type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} isAnimationActive={animate}/></LineChart></ResponsiveContainer>:<Empty label="participation trend data"/>}</ChartCard>
      <ChartCard title="Goal Completion Trend" description="Completed goals grouped by target month" summary={latestGoal?`Latest completion is ${latestGoal.rate} percent.`:'No goal trend data.'} reduceMotion={reduceMotion}>{result.goalTrend.length?<ResponsiveContainer><LineChart data={result.goalTrend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="period"/><YAxis domain={[0,100]} width={46}/><Tooltip content={<Tip/>}/><Line name="Completion rate" type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5} isAnimationActive={animate}/></LineChart></ResponsiveContainer>:<Empty label="goal completion trend data"/>}</ChartCard>
    </div>
    <motion.section initial={reduceMotion?false:{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className={card}><h2 className="font-semibold text-slate-950 dark:text-white">Key Insights</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Highest emission category',highest?.category,highest&&`${highest.emissions.toLocaleString()} kg CO₂e`],['Best performing department',best?.department,best&&`${best.emissions.toLocaleString()} kg CO₂e`],['Participation trend',latestParticipation&&`${latestParticipation.rate}%`,'Latest reporting month'],['Goal completion trend',latestGoal&&`${latestGoal.rate}%`,'Latest target month']].map(([label,value,note])=><div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-900 dark:text-white">{value||'Not available'}</p>{note&&<p className="mt-1 text-xs text-slate-400">{note}</p>}</div>)}</div></motion.section>
  </div>
  );
}
