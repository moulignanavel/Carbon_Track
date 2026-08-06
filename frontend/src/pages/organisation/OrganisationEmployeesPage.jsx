import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Leaf, Pencil, Search, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateOrganisationEmployee } from '@/api/organisationApi';

const EMPTY_DATA={};
const STATE_KEY='carbontrack.organisation.employees.state';
const pageSize=8;
const palette=['#059669','#3b82f6','#f59e0b','#0f766e','#64748b','#84cc16'];
const card = 'rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900';
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
    .map((part) => part[0])
    .join('')
    .toUpperCase();

function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading employees">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 rounded-xl bg-white p-4 dark:bg-slate-900">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
function Empty() {
  return (
    <div className="grid min-h-60 place-items-center px-4 text-center">
      <div>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <Leaf className="h-5 w-5 text-emerald-600" />
        </span>
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">No employees match these filters</h2>
        <p className="mt-0.5 text-xs text-slate-500">Try another search, department, or participation status.</p>
      </div>
    </div>
  );
}
function Avatar({ employee, size = 'h-8 w-8' }) {
  return employee.photo || employee.avatarUrl ? (
    <img src={employee.photo || employee.avatarUrl} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200`} aria-hidden="true">
      {initials(employee.name)}
    </span>
  );
}
function Progress({ value }) {
  const safe = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-slate-500">Progress</span>
        <span className="font-semibold">{safe.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

function EmployeeDrawer({ employee, onClose }) {
  const reduceMotion = useReducedMotion(),
    closeRef = useRef(null),
    previousFocus = useRef(document.activeElement);
  useEffect(() => {
    const returnFocus = previousFocus.current;
    closeRef.current?.focus();
    const handle = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
      returnFocus?.focus?.();
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.aside
        initial={reduceMotion ? false : { x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 48, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-drawer-title"
        className="h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar employee={employee} size="h-10 w-10" />
            <div className="min-w-0">
              <h2 id="employee-drawer-title" className="truncate text-base font-bold text-slate-950 dark:text-white">
                {employee.name}
              </h2>
              <p className="text-xs text-slate-500">
                {employee.department || 'Unassigned'} · {employee.status || 'Status unavailable'}
              </p>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close employee details" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <section className="mt-5" aria-labelledby="profile-heading">
          <h3 id="profile-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Profile information
          </h3>
          <dl className="mt-2.5 grid grid-cols-2 gap-2.5">
            {[
              ['Department', employee.department || 'Unassigned'],
              ['Carbon score', Number.isFinite(Number(employee.carbonScore)) ? Number(employee.carbonScore).toFixed(1) : 'Not available'],
              ['Current footprint', `${Number(employee.footprint || 0).toLocaleString()} kg CO₂e`],
              ['Activities logged', employee.activitiesCount.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                <dt className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</dt>
                <dd className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Goal progress</h3>
          <div className="mt-2.5 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            <Progress value={employee.goalProgress} />
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Monthly trend</h3>
          <div className="mt-2.5 h-44 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
            {employee.monthlyTrend.length ? (
              <ResponsiveContainer>
                <LineChart data={employee.monthlyTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={38} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} kg CO₂e`, 'Emissions']} />
                  <Line type="monotone" dataKey="emissions" stroke="#059669" strokeWidth= {2} isAnimationActive={!reduceMotion} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-xs text-slate-500">No monthly trend available.</p>
            )}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Category breakdown</h3>
          <div className="mt-2.5 h-44 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
            {employee.categories.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={employee.categories} dataKey="emissions" nameKey="category" innerRadius="45%" outerRadius="75%">
                    {employee.categories.map((row, index) => (
                      <Cell key={row.category} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} kg CO₂e`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-xs text-slate-500">No category activity available.</p>
            )}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Recent activities</h3>
          {employee.recent.length ? (
            <ul className="mt-2.5 space-y-2">
              {employee.recent.map((row) => (
                <li key={row.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{row.activity || row.category}</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{Number(row.emission || 0).toLocaleString()} kg CO₂e</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {row.category} · {row.date}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No recent activities available.</p>
          )}
        </section>
      </motion.aside>
    </div>
  );
}

function EmployeeEditDialog({ employee, onClose, onSaved }) {
  const reduceMotion = useReducedMotion(),
    closeRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: employee.name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department === 'Unassigned' ? '' : employee.department || '',
    status: String(employee.status || 'ACTIVE').toUpperCase(),
  });
  useEffect(() => {
    closeRef.current?.focus();
    const handle = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose, saving]);
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateOrganisationEmployee(employee.id, form);
      toast.success('Employee details updated');
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Unable to update employee');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <motion.form
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-employee-title"
        className="w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="edit-employee-title" className="text-base font-bold text-slate-950 dark:text-white">
              Edit employee
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Update organisation employee details.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={saving} aria-label="Close edit employee" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Full name</span>
            <input name="fullName" required value={form.fullName} onChange={change} className={control} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Email</span>
            <input name="email" type="email" required value={form.email} onChange={change} className={control} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</span>
            <input name="phone" value={form.phone} onChange={change} className={control} placeholder="Optional" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Department</span>
            <input name="department" value={form.department} onChange={change} className={control} placeholder="Department" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Status</span>
            <select name="status" value={form.status} onChange={change} className={control}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function OrganisationEmployeesPage({ data, loading, error, onRetry, onReload = onRetry }) {
  const source = data || EMPTY_DATA,
    employees = useMemo(() => source.employees || [], [source.employees]),
    logs = useMemo(() => source.activityLogs || [], [source.activityLogs]);
  const saved = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    } catch {
      return {};
    }
  }, []);
  const [query, setQuery] = useState(saved.query || ''),
    [debounced, setDebounced] = useState(query),
    [department, setDepartment] = useState(saved.department || ''),
    [participation, setParticipation] = useState(saved.participation || ''),
    [sort, setSort] = useState(saved.sort || 'name'),
    [page, setPage] = useState(saved.page || 1),
    [drawer, setDrawer] = useState(null),
    [editing, setEditing] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ query, department, participation, sort, page }));
  }, [query, department, participation, sort, page]);
  const departments = useMemo(() => [...new Set(employees.map((row) => row.department || 'Unassigned'))].sort(), [employees]);
  const enriched = useMemo(
    () =>
      employees.map((employee) => {
        const own = logs.filter((row) => row.employee === employee.name).sort((a, b) => String(b.date).localeCompare(String(a.date))),
          now = new Date(),
          monthStart = new Date(now.getFullYear(), now.getMonth(), 1),
          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1),
          current = own.filter((row) => {
            const date = dateOf(row.date);
            return date && date >= monthStart;
          }),
          previous = own.filter((row) => {
            const date = dateOf(row.date);
            return date && date >= previousStart && date < monthStart;
          }),
          footprint = current.reduce((sum, row) => sum + Number(row.emission || 0), 0),
          previousFootprint = previous.reduce((sum, row) => sum + Number(row.emission || 0), 0),
          change = previousFootprint ? ((footprint - previousFootprint) * 100) / previousFootprint : null,
          monthly = [
            ...own
              .reduce((map, row) => {
                const date = dateOf(row.date);
                if (!date) return map;
                const key = `${date.getFullYear()}-${date.getMonth()}`,
                  label = date.toLocaleString('en', { month: 'short' });
                const value = map.get(key) || { key, month: label, emissions: 0 };
                value.emissions += Number(row.emission || 0);
                map.set(key, value);
                return map;
              }, new Map())
              .values(),
          ]
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-6),
          categories = [...own.reduce((map, row) => {
            const key = row.category || 'Uncategorised';
            map.set(key, (map.get(key) || 0) + Number(row.emission || 0));
            return map;
          }, new Map())].map(([category, emissions]) => ({ category, emissions: Number(emissions.toFixed(2)) }));
        return { ...employee, footprint: Number(footprint.toFixed(2)), monthlyChange: change, activitiesCount: own.length, participating: current.length > 0, monthlyTrend: monthly, categories, recent: own.slice(0, 6) };
      }),
    [employees, logs]
  );
  const filtered = useMemo(
    () =>
      enriched
        .filter(
          (row) =>
            (!debounced || row.name?.toLowerCase().includes(debounced) || row.department?.toLowerCase().includes(debounced)) &&
            (!department || (row.department || 'Unassigned') === department) &&
            (!participation || (participation === 'active' ? row.participating : !row.participating))
        )
        .sort((a, b) => (sort === 'footprint' ? b.footprint - a.footprint : sort === 'activities' ? b.activitiesCount - a.activitiesCount : sort === 'goal' ? Number(b.goalProgress || 0) - Number(a.goalProgress || 0) : String(a.name).localeCompare(String(b.name)))),
    [enriched, debounced, department, participation, sort]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} p-4 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Employees could not be loaded</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            Retry
          </button>
        </div>
      </section>
    );
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">People and participation</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Employees</h1>
          <p className="mt-0.5 text-xs text-slate-500">Review employee sustainability participation using verified activity data.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <Users className="h-3.5 w-3.5" />
          {employees.length.toLocaleString()} employees
        </div>
      </header>
      <section className={`${card} p-3.5`} aria-label="Employee filters">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <span className="sr-only">Search employees</span>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              className={`${control} pl-8`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or department"
            />
          </label>
          <select
            aria-label="Filter by department"
            className={control}
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All departments</option>
            {departments.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Filter by participation"
            className={control}
            value={participation}
            onChange={(event) => {
              setParticipation(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All participation</option>
            <option value="active">Participating this month</option>
            <option value="inactive">No activity this month</option>
          </select>
          <select
            aria-label="Sort employees"
            className={control}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">Sort by name</option>
            <option value="footprint">Highest footprint</option>
            <option value="activities">Most activities</option>
            <option value="goal">Highest goal progress</option>
          </select>
        </div>
      </section>
      <section className={`${card} overflow-hidden p-0`}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <tr>
                {['Employee', 'Department', 'Carbon Footprint', 'Monthly Change', 'Activities Logged', 'Goal Progress', 'Participation Status', 'Action'].map((label) => (
                  <th key={label} className="px-3 py-2.5 font-bold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar employee={row} />
                      <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department || 'Unassigned'}</td>
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{row.footprint.toLocaleString()} kg CO₂e</td>
                  <td className={`px-3 py-2 font-bold ${row.monthlyChange === null ? 'text-slate-400' : row.monthlyChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.monthlyChange === null ? 'Not available' : `${row.monthlyChange > 0 ? '+' : ''}${row.monthlyChange.toFixed(1)}%`}
                  </td>
                  <td className="px-3 py-2 font-semibold">{row.activitiesCount}</td>
                  <td className="px-3 py-2">
                    <div className="w-24">
                      <Progress value={row.goalProgress} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.participating ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {row.participating ? 'Participating' : 'No activity'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setDrawer(row)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-50">
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button type="button" onClick={() => setEditing(row)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2.5 p-3 lg:hidden">
          {visible.map((row) => (
            <article key={row.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <Avatar employee={row} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xs font-bold text-slate-900 dark:text-white">{row.name}</h2>
                  <p className="text-[11px] text-slate-500">{row.department || 'Unassigned'}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.participating ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{row.participating ? 'Active' : 'No activity'}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Footprint</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{row.footprint.toLocaleString()} kg CO₂e</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Activities</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{row.activitiesCount}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <Progress value={row.goalProgress} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDrawer(row)} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button type="button" onClick={() => setEditing(row)} className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && <Empty />}
        {!!visible.length && (
          <footer className="flex flex-col gap-2.5 border-t border-slate-100 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" aria-label="Previous employee page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-1.5 disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Page {page} of {pages}
              </span>
              <button type="button" aria-label="Next employee page" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-1.5 disabled:opacity-40">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        )}
      </section>
      {drawer && <EmployeeDrawer employee={drawer} onClose={() => setDrawer(null)} />}
      {editing && <EmployeeEditDialog employee={editing} onClose={() => setEditing(null)} onSaved={onReload} />}
    </div>
  );
}
