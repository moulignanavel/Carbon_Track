import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Award, Leaf, Search, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatUserName } from '@/utils/formatters';

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
  const { t } = useTranslation();
  return (
    <div className="grid min-h-60 place-items-center text-center">
      <div>
        <Leaf className="mx-auto h-7 w-7 text-emerald-500" />
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">{t('orgPortal.noRankingData', { defaultValue: 'No ranking data available' })}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.noEmployeesMatchRanking', { defaultValue: 'No employees match the current search and department filter.' })}</p>
      </div>
    </div>
  );
}
function Filters({ query, setQuery, department, setDepartment, departments }) {
  const { t } = useTranslation();
  return (
    <section className={card} aria-label="Ranking filters">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="relative">
          <span className="sr-only">{t('orgPortal.searchRankedEmployees', { defaultValue: 'Search ranked employees' })}</span>
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('orgPortal.searchEmployeeDept', { defaultValue: 'Search employee or department' })} className={`${control} pl-8`} />
        </label>
        <select aria-label="Filter rankings by department" value={department} onChange={(event) => setDepartment(event.target.value)} className={control}>
          <option value="">{t('orgPortal.allDepartments', { defaultValue: 'All departments' })}</option>
          {departments.map((value) => (
            <option key={value} value={value}>{t(`departments.${value}`, { defaultValue: value })}</option>
          ))}
        </select>
      </div>
    </section>
  );
}
function Participation({ value, max }) {
  const { t } = useTranslation();
  const ratio = max ? value / max : 0,
    label = ratio >= 0.67 ? t('orgNav.high', 'High') : ratio >= 0.34 ? t('orgNav.moderate', 'Moderate') : value ? t('orgNav.active', 'Active') : t('orgNav.noActivity', 'No activity');
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ratio >= 0.67 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : value ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-slate-100 text-slate-500'}`}>{label}</span>;
}
function TopPodium({ top, reduceMotion }) {
  const { t, i18n } = useTranslation();
  const first = top[0];
  const second = top[1];
  const third = top[2];

  const slots = [
    { item: second, posKey: 'ndPlace', defaultPos: '2nd Place', rankNum: 2, badge: '🥈', color: 'from-slate-200/95 via-slate-100/70 to-white dark:from-slate-800/90 dark:via-slate-900/70 dark:to-slate-950', border: 'border-slate-300 dark:border-slate-700', stepBg: 'bg-gradient-to-t from-slate-300/60 to-slate-200/30 dark:from-slate-700/60 dark:to-slate-800/30', stepHeight: 'h-24 sm:h-28', ring: 'ring-slate-400 dark:ring-slate-500', textAccent: 'text-slate-800 dark:text-slate-200' },
    { item: first, posKey: 'stPlace', defaultPos: '1st Place', rankNum: 1, badge: '👑 🥇', color: 'from-amber-200/95 via-amber-100/60 to-white dark:from-amber-900/80 dark:via-amber-950/50 dark:to-slate-950', border: 'border-amber-400 dark:border-amber-500 shadow-amber-200/50', stepBg: 'bg-gradient-to-t from-amber-400/50 to-amber-300/30 dark:from-amber-600/50 dark:to-amber-500/20', stepHeight: 'h-32 sm:h-36', ring: 'ring-amber-400 ring-offset-2 dark:ring-amber-500', textAccent: 'text-amber-900 dark:text-amber-400' },
    { item: third, posKey: 'rdPlace', defaultPos: '3rd Place', rankNum: 3, badge: '🥉', color: 'from-orange-200/90 via-amber-100/60 to-white dark:from-orange-950/80 dark:via-amber-950/50 dark:to-slate-950', border: 'border-amber-600/60 dark:border-amber-600/70', stepBg: 'bg-gradient-to-t from-amber-600/40 to-orange-500/20 dark:from-amber-700/40 dark:to-orange-600/20', stepHeight: 'h-20 sm:h-22', ring: 'ring-amber-600 dark:ring-amber-500', textAccent: 'text-amber-950 dark:text-orange-400' },
  ];

  return (
    <section aria-label="Winner podium" className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-end">
      {slots.map(({ item, posKey, defaultPos, rankNum, badge, color, border, stepBg, stepHeight, ring, textAccent }) => {
        if (!item) return null;
        return (
          <motion.article
            key={item.id || posKey}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex w-full max-w-xs flex-col items-center justify-between rounded-2xl border ${border} bg-gradient-to-b ${color} p-4 text-center shadow-lg sm:w-1/3`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-black shadow-md border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <span className={textAccent}>{badge} {t(`orgNav.${posKey}`, defaultPos)}</span>
            </div>
            <div className="mt-3 flex flex-col items-center">
              <div className={`rounded-full p-1 ring-2 ${ring}`}>
                <Avatar employee={item} />
              </div>
              <h3 className="mt-2 text-sm font-black tracking-tight text-slate-950 dark:text-white">{formatUserName(item.name, i18n.language)}</h3>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.department ? t(`departments.${item.department}`, { defaultValue: item.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</p>
            </div>

            <div className="mt-3 w-full rounded-xl bg-white/85 p-2.5 shadow-xs border border-white/60 dark:bg-slate-900/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">{t('orgNav.carbonSaved', 'Carbon Saved')}</p>
              <p className={`text-base font-black ${textAccent}`}>
                {item.carbonSaved.toLocaleString()} <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</span>
              </p>
              <div className="mt-1 flex items-center justify-center gap-3 text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                <span>{t('orgNav.score', 'Score')}: {item.score.toFixed(1)}</span>
              </div>
            </div>

            <div className={`mt-3 flex ${stepHeight} w-full items-center justify-center rounded-xl ${stepBg} border border-white/30 shadow-inner`}>
              <span className={`text-3xl font-black ${textAccent} opacity-90`}>#{rankNum}</span>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}

export default function OrganisationRankingsPage({ data, loading, error, onRetry, lowest = false }) {
  const { t, i18n } = useTranslation();
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
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1),
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return employees
      .map((employee) => {
        const empLogs = logs.filter((log) => log.employee === employee.name);
        const currentLogs = empLogs.filter((log) => {
          const d = dateOf(log.date);
          return d && d >= currentStart && d <= now;
        });
        const prevLogs = empLogs.filter((log) => {
          const d = dateOf(log.date);
          return d && d >= prevStart && d <= prevEnd;
        });
        const currentFootprint = currentLogs.reduce((sum, log) => sum + Number(log.emission || 0), 0);
        const previousFootprint = prevLogs.reduce((sum, log) => sum + Number(log.emission || 0), 0);
        const trend = previousFootprint > 0 ? ((currentFootprint - previousFootprint) / previousFootprint) * 100 : null;
        const carbonSaved = Math.max(0, (Number(employee.baselineKg || 100) - currentFootprint));
        const consistency = empLogs.length ? Math.min(100, Math.round((currentLogs.length / Math.max(1, empLogs.length)) * 100)) : 0;
        const score = Math.max(0, 100 - (currentFootprint / (Number(employee.baselineKg || 100) || 1)) * 50);
        return {
          ...employee,
          currentFootprint: Number(currentFootprint.toFixed(2)),
          previousFootprint: Number(previousFootprint.toFixed(2)),
          trend,
          carbonSaved: Number(carbonSaved.toFixed(2)),
          consistency,
          score,
          activitiesLogged: currentLogs.length,
          currentActivities: currentLogs.length,
        };
      })
      .filter((row) => {
        const text = `${row.name || ''} ${row.department || ''}`.toLowerCase();
        return (!debounced || text.includes(debounced)) && (!department || row.department === department);
      })
      .sort((a, b) => (lowest ? a.currentFootprint - b.currentFootprint : b.carbonSaved - a.carbonSaved))
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [employees, logs, debounced, department, lowest]);

  const maxParticipation = useMemo(() => Math.max(1, ...ranked.map((r) => r.currentActivities || 0)), [ranked]);

  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">{t('orgPortal.rankingsLoadError', { defaultValue: 'Rankings could not be loaded' })}</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </section>
    );

  if (lowest)
    return (
      <div className="space-y-4">
        <header>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">{t('orgNav.climateExcellence', { defaultValue: 'Climate excellence' })}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">{t('orgNav.lowestFootprintLeaderboard', { defaultValue: 'Lowest Footprint Leaderboard' })}</h1>
          <p className="mt-0.5 text-xs text-slate-500">{t('orgNav.lowestFootprintDesc', { defaultValue: 'Employees ranked by lowest recorded carbon impact in the current period.' })}</p>
        </header>
        <Filters query={query} setQuery={setQuery} department={department} setDepartment={setDepartment} departments={departments} />
        <section className={`${card} overflow-hidden p-0`}>
          {ranked.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                    <tr>
                      {[t('orgNav.rank', { defaultValue: 'Rank' }), t('orgNav.colEmployee', { defaultValue: 'Employee' }), t('orgNav.colDepartment', { defaultValue: 'Department' }), t('orgNav.currentFootprint', { defaultValue: 'Current Footprint' }), t('orgNav.previousMonth', { defaultValue: 'Previous Month' }), t('orgNav.monthlyTrend', { defaultValue: 'Monthly Trend' }), t('orgNav.activitiesLogged', { defaultValue: 'Activities Logged' }), t('orgNav.consistency', { defaultValue: 'Consistency' })].map((label) => (
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
                              <span className="font-bold text-slate-900 dark:text-white">{formatUserName(row.name, i18n.language)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400">{row.currentFootprint.toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</td>
                          <td className="px-3 py-2 text-slate-500">{row.previousFootprint.toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</td>
                          <td className={`px-3 py-2 font-bold ${row.trend === null ? 'text-slate-400' : row.trend <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span className="inline-flex items-center gap-1">
                              <TrendIcon className="h-3.5 w-3.5" />
                              {row.trend === null ? t('common.notAvailable', { defaultValue: 'Not available' }) : `${Math.abs(row.trend).toFixed(1)}%`}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold">{row.activitiesLogged}</td>
                          <td className="px-3 py-2">
                            <span className="font-bold">{row.consistency}%</span>
                            <span className="ml-1 text-[10px] text-slate-400">{t('orgNav.last3Mos', { defaultValue: 'last 3 mos' })}</span>
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
                      <span className="text-xs font-bold text-slate-950 dark:text-white">#{row.rank}</span>
                      <Avatar employee={row} />
                      <div>
                        <h2 className="text-xs font-bold text-slate-950 dark:text-white">{formatUserName(row.name, i18n.language)}</h2>
                        <p className="text-[11px] text-slate-500">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</p>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-[10px] text-slate-500 uppercase">{t('orgPortal.currentFootprint', { defaultValue: 'Current footprint' })}</dt>
                        <dd className="font-bold text-slate-950 dark:text-white">{row.currentFootprint} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-slate-500 uppercase">{t('orgPortal.consistency', { defaultValue: 'Consistency' })}</dt>
                        <dd className="font-bold text-slate-950 dark:text-white">{row.consistency}%</dd>
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
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">{t('orgNav.verifiedPerformance', { defaultValue: 'Verified performance' })}</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">{t('orgNav.topContributors', { defaultValue: 'Top Contributors' })}</h1>
        <p className="mt-0.5 text-xs text-slate-500">{t('orgNav.topContributorsDesc', { defaultValue: 'Recognition based on backend carbon-saved and sustainability performance data.' })}</p>
      </header>
      <Filters query={query} setQuery={setQuery} department={department} setDepartment={setDepartment} departments={departments} />
      {ranked.length ? (
        <>
          <TopPodium top={top} reduceMotion={reduceMotion} />
          <section className={`${card} overflow-hidden p-0`}>
            <div className="border-b border-slate-100 px-3.5 py-3 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{t('orgNav.remainingContributors', { defaultValue: 'Remaining contributors' })}</h2>
            </div>
            {remaining.length ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                      <tr>
                        {[t('orgNav.rank', { defaultValue: 'Rank' }), t('orgNav.colEmployee', { defaultValue: 'Employee' }), t('orgNav.colDepartment', { defaultValue: 'Department' }), t('orgNav.carbonSaved', { defaultValue: 'Carbon Saved' }), t('orgNav.sustainabilityScore', { defaultValue: 'Sustainability Score' }), t('orgNav.participationLevel', { defaultValue: 'Participation Level' })].map((label) => (
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
                              <span className="font-bold text-slate-900 dark:text-white">{formatUserName(row.name, i18n.language)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400">{row.carbonSaved.toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</td>
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
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{formatUserName(row.name, i18n.language)}</h3>
                          <p className="text-[11px] text-slate-500">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">{row.carbonSaved} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e {t('orgPortal.saved', { defaultValue: 'saved' })}</p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p className="p-4 text-xs text-slate-500">{t('orgPortal.allContributorsShown', { defaultValue: 'All matching contributors are shown above.' })}</p>
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
