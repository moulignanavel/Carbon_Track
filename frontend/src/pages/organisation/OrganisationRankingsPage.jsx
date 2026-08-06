import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Award, Leaf, Search, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const EMPTY_DATA = {};
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const dateOf = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const initials = (name) =>
  String(name || 'Employee')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0])
    .join('')
    .toUpperCase();
function Avatar({ employee }) {
  return employee.photo || employee.avatarUrl ? (
    <img src={employee.photo || employee.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
  ) : (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" aria-hidden="true">
      {initials(employee.name)}
    </span>
  );
}
function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading organisation rankings">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-3.5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-2 rounded-xl bg-white p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
function Empty() {
  return (
    <div className="grid min-h-60 place-items-center text-center">
      <div>
        <Leaf className="mx-auto h-7 w-7 text-emerald-500" />
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">No ranking data available</h2>
        <p className="mt-0.5 text-xs text-slate-500">No employees match the current search and department filter.</p>
      </div>
    </div>
  );
}
function Filters({ query, setQuery, department, setDepartment, departments }) {
  return (
    <section className={card} aria-label="Ranking filters">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="relative">
          <span className="sr-only">Search ranked employees</span>
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employee or department" className={`${control} pl-8`} />
        </label>
        <select aria-label="Filter rankings by department" value={department} onChange={(event) => setDepartment(event.target.value)} className={control}>
          <option value="">All departments</option>
          {departments.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
    </section>
  );
}
function Participation({ value, max }) {
  const ratio = max ? value / max : 0,
    label = ratio >= 0.67 ? 'High' : ratio >= 0.34 ? 'Moderate' : value ? 'Active' : 'No activity';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ratio >= 0.67 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : value ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-slate-100 text-slate-500'}`}>{label}</span>;
}

export default function OrganisationRankingsPage({ data, loading, error, onRetry, lowest = false }) {
  const reduceMotion = useReducedMotion(),
    source = data || EMPTY_DATA,
    employees = useMemo(() => source.employees || [], [source.employees]),
    logs = useMemo(() => source.activityLogs || [], [source.activityLogs]);
  const [query, setQuery] = useState(''),
    [debounced, setDebounced] = useState(''),
    [department, setDepartment] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const departments = useMemo(() => [...new Set(employees.map((row) => row.department || 'Unassigned'))].sort(), [employees]);
  const ranked = useMemo(() => {
    const now = new Date(),
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1),
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1),
      monthKeys = Array.from({ length: 3 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        return `${date.getFullYear()}-${date.getMonth()}`;
      });
    return employees
      .map((employee) => {
        const own = logs.filter((row) => row.employee === employee.name),
          current = own.filter((row) => {
            const date = dateOf(row.date);
            return date && date >= currentStart;
          }),
          previous = own.filter((row) => {
            const date = dateOf(row.date);
            return date && date >= previousStart && date < currentStart;
          }),
          currentFootprint = current.reduce((sum, row) => sum + Number(row.emission || 0), 0),
          previousFootprint = previous.reduce((sum, row) => sum + Number(row.emission || 0), 0),
          activeMonths = new Set(
            own
              .map((row) => {
                const date = dateOf(row.date);
                return date ? `${date.getFullYear()}-${date.getMonth()}` : null;
              })
              .filter(Boolean)
          ),
          consistentMonths = monthKeys.filter((key) => activeMonths.has(key)).length,
          trend = previousFootprint ? ((currentFootprint - previousFootprint) * 100) / previousFootprint : null;
        return {
          ...employee,
          currentFootprint: Number(currentFootprint.toFixed(2)),
          previousFootprint: Number(previousFootprint.toFixed(2)),
          trend,
          activitiesLogged: own.length,
          currentActivities: current.length,
          consistency: Number(((consistentMonths * 100) / monthKeys.length).toFixed(0)),
          carbonSaved: Number(employee.carbonSaved || 0),
          score: Number(employee.carbonScore || 0),
        };
      })
      .filter((row) => (!debounced || row.name?.toLowerCase().includes(debounced) || row.department?.toLowerCase().includes(debounced)) && (!department || (row.department || 'Unassigned') === department))
      .sort((a, b) => (lowest ? a.currentFootprint - b.currentFootprint : b.carbonSaved - a.carbonSaved))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [employees, logs, debounced, department, lowest]);
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} p-4 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Rankings could not be loaded</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            Retry
          </button>
        </div>
      </section>
    );
  const maxParticipation = Math.max(0, ...ranked.map((row) => row.currentActivities));
  if (lowest)
    return (
      <div className="space-y-4">
        <header>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Verified performance</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Lowest Footprint</h1>
          <p className="mt-0.5 text-xs text-slate-500">Employees ranked by their current-month recorded carbon footprint.</p>
        </header>
        <Filters query={query} setQuery={setQuery} department={department} setDepartment={setDepartment} departments={departments} />
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">Rankings are based on available verified organisation activity data.</div>
        <section className={`${card} overflow-hidden p-0`}>
          {ranked.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                    <tr>
                      {['Rank', 'Employee', 'Department', 'Current Footprint', 'Previous Footprint', 'Trend', 'Activities Logged', 'Consistency'].map((label) => (
                        <th key={label} className="px-3 py-2.5 font-bold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((row) => {
                      const TrendIcon = row.trend === null ? Minus : row.trend <= 0 ? TrendingDown : TrendingUp;
                      return (
                        <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 font-bold">#{row.rank}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <Avatar employee={row} />
                              <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department || 'Unassigned'}</td>
                          <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{row.currentFootprint.toLocaleString()} kg CO₂e</td>
                          <td className="px-3 py-2 text-slate-500">{row.previousFootprint.toLocaleString()} kg CO₂e</td>
                          <td className={`px-3 py-2 font-bold ${row.trend === null ? 'text-slate-400' : row.trend <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span className="inline-flex items-center gap-1">
                              <TrendIcon className="h-3.5 w-3.5" />
                              {row.trend === null ? 'Not available' : `${Math.abs(row.trend).toFixed(1)}%`}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold">{row.activitiesLogged}</td>
                          <td className="px-3 py-2">
                            <span className="font-bold">{row.consistency}%</span>
                            <span className="ml-1 text-[10px] text-slate-400">last 3 mos</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-2.5 p-3 md:hidden">
                {ranked.map((row) => (
                  <article key={row.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">#{row.rank}</span>
                      <Avatar employee={row} />
                      <div>
                        <h2 className="text-xs font-bold text-slate-900 dark:text-white">{row.name}</h2>
                        <p className="text-[11px] text-slate-500">{row.department || 'Unassigned'}</p>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-[10px] text-slate-500 uppercase">Current footprint</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{row.currentFootprint} kg CO₂e</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-slate-500 uppercase">Consistency</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{row.consistency}%</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <Empty />
          )}
        </section>
      </div>
    );
  const top = ranked.slice(0, 3),
    remaining = ranked.slice(3);
  return (
    <div className="space-y-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Verified performance</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Top Contributors</h1>
        <p className="mt-0.5 text-xs text-slate-500">Recognition based on backend carbon-saved and sustainability performance data.</p>
      </header>
      <Filters query={query} setQuery={setQuery} department={department} setDepartment={setDepartment} departments={departments} />
      {ranked.length ? (
        <>
          <section aria-label="Top three contributors" className="grid gap-3.5 md:grid-cols-3">
            {top.map((row, index) => (
              <motion.article key={row.id} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: index * 0.06 }} className={`${card} relative overflow-hidden`}>
                <motion.span initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.18 + index * 0.06, duration: 0.3 }} className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" aria-label={`Rank ${row.rank}`}>
                  <Award className="h-4 w-4" />
                </motion.span>
                <div className="flex items-center gap-2.5 pr-10">
                  <Avatar employee={row} />
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">Rank #{row.rank}</p>
                    <h2 className="text-xs font-bold text-slate-950 dark:text-white">{row.name}</h2>
                    <p className="text-[11px] text-slate-500">{row.department || 'Unassigned'}</p>
                  </div>
                </div>
                <dl className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase">Carbon saved</dt>
                    <dd className="mt-0.5 font-black text-emerald-700 dark:text-emerald-400">{row.carbonSaved.toLocaleString()} kg CO₂e</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase">Score</dt>
                    <dd className="mt-0.5 font-black text-slate-900 dark:text-white">{row.score.toFixed(1)}</dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <Participation value={row.currentActivities} max={maxParticipation} />
                </div>
              </motion.article>
            ))}
          </section>
          <section className={`${card} overflow-hidden p-0`}>
            <div className="border-b border-slate-100 px-3.5 py-3 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Remaining contributors</h2>
            </div>
            {remaining.length ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                      <tr>
                        {['Rank', 'Employee', 'Department', 'Carbon Saved', 'Sustainability Score', 'Participation Level'].map((label) => (
                          <th key={label} className="px-3 py-2.5 font-bold">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 font-bold">#{row.rank}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <Avatar employee={row} />
                              <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department || 'Unassigned'}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400">{row.carbonSaved.toLocaleString()} kg CO₂e</td>
                          <td className="px-3 py-2 font-semibold">{row.score.toFixed(1)}</td>
                          <td className="px-3 py-2">
                            <Participation value={row.currentActivities} max={maxParticipation} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-2.5 p-3 md:hidden">
                  {remaining.map((row) => (
                    <article key={row.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">#{row.rank}</span>
                        <Avatar employee={row} />
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{row.name}</h3>
                          <p className="text-[11px] text-slate-500">{row.department || 'Unassigned'}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">{row.carbonSaved} kg CO₂e saved</p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p className="p-4 text-xs text-slate-500">All matching contributors are shown above.</p>
            )}
          </section>
        </>
      ) : (
        <section className={card}>
          <Empty />
        </section>
      )}
    </div>
  );
}
