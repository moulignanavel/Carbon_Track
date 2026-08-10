import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Leaf, Pencil, Search, UserPlus, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createOrganisationEmployee, updateOrganisationEmployee, getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/api/organisationApi';
import { formatUserName } from '@/utils/formatters';

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
  const { t } = useTranslation();
  return (
    <div className="grid min-h-60 place-items-center px-4 text-center">
      <div>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <Leaf className="h-5 w-5 text-emerald-600" />
        </span>
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">{t('orgPortal.noEmployeesMatch', { defaultValue: 'No employees match these filters' })}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.tryAnotherSearch', { defaultValue: 'Try another search, department, or participation status.' })}</p>
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
  const { t } = useTranslation();
  const safe = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-slate-500">{t('orgPortal.progress', { defaultValue: 'Progress' })}</span>
        <span className="font-semibold">{safe.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

const DEPARTMENT_OPTIONS = [
  'Sustainability',
  'Management',
  'Engineering',
  'Operations',
  'Finance',
  'Human Resources',
  'Marketing',
  'Sales',
  'IT & Infrastructure',
  'Logistics',
  'Legal & Compliance'
];

function AddEmployeeModal({ onClose, onSaved }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', department: 'Sustainability', phone: '' });
  const change = (e) => {
    setErrorMsg(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    closeRef.current?.focus();
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMsg(t('orgPortal.employeeFieldsRequired', { defaultValue: 'Full name, username, email and password are required.' }));
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg(t('orgPortal.passwordMinLength', { defaultValue: 'Password must be at least 8 characters.' }));
      return;
    }
    setSaving(true);
    try {
      await createOrganisationEmployee(form);
      toast.success(`${t('orgPortal.employeeAdded', { defaultValue: 'Employee added successfully!' })}: "${form.fullName}"`);
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || t('orgPortal.employeeAddFailed', { defaultValue: 'Failed to add employee.' });
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <motion.form
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-employee-title"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="add-employee-title" className="text-base font-bold text-slate-950 dark:text-white">{t('orgPortal.addEmployee', { defaultValue: 'Add Employee' })}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.addEmployeeSubtitle', { defaultValue: 'Create a new employee account for your organisation.' })}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={saving} aria-label="Close add employee" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.fullName', { defaultValue: 'Full name' })} *</span>
            <input name="fullName" required value={form.fullName} onChange={change} className={control} placeholder="e.g. Priya Sharma" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('auth.username', { defaultValue: 'Username' })} *</span>
            <input name="username" required value={form.username} onChange={change} className={control} placeholder="e.g. priya.sharma" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.workEmail', { defaultValue: 'Work email' })} *</span>
            <input name="email" type="email" required value={form.email} onChange={change} className={control} placeholder="e.g. priya@company.com" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('auth.password', { defaultValue: 'Password' })} *</span>
            <input name="password" type="password" required value={form.password} onChange={change} className={control} placeholder="Min. 8 characters" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.colDepartment', { defaultValue: 'Department' })}</span>
            <select name="department" value={form.department} onChange={change} className={control}>
              <option value="">{t('orgPortal.selectDepartment', { defaultValue: 'Select Department' })}</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>{t(`departments.${dept}`, { defaultValue: dept })}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.phone', { defaultValue: 'Phone' })}</span>
            <input name="phone" value={form.phone} onChange={change} className={control} placeholder="Optional" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">{t('common.cancel', { defaultValue: 'Cancel' })}</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            <UserPlus className="h-3.5 w-3.5" />
            {saving ? t('orgPortal.adding', { defaultValue: 'Adding…' }) : t('orgPortal.addEmployee', { defaultValue: 'Add Employee' })}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function EmployeeDrawer({ employee, onClose }) {
  const { t, i18n } = useTranslation();
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
                {formatUserName(employee.name, i18n.language)}
              </h2>
              <p className="text-xs text-slate-500">
                {employee.department ? t(`departments.${employee.department}`, { defaultValue: employee.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })} · {employee.status || t('orgPortal.statusUnavailable', { defaultValue: 'Status unavailable' })}
              </p>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close employee details" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <section className="mt-5" aria-labelledby="profile-heading">
          <h3 id="profile-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {t('orgPortal.profileInfo', { defaultValue: 'Profile information' })}
          </h3>
          <dl className="mt-2.5 grid grid-cols-2 gap-2.5">
            {[
              [t('orgPortal.colDepartment', { defaultValue: 'Department' }), employee.department ? t(`departments.${employee.department}`, { defaultValue: employee.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })],
              [t('orgPortal.carbonScore', { defaultValue: 'Carbon score' }), Number.isFinite(Number(employee.carbonScore)) ? Number(employee.carbonScore).toFixed(1) : t('common.notAvailable', { defaultValue: 'Not available' })],
              [t('orgPortal.currentFootprint', { defaultValue: 'Current footprint' }), `${Number(employee.footprint || 0).toLocaleString()} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e`],
              [t('orgPortal.activitiesLogged', { defaultValue: 'Activities logged' }), employee.activitiesCount.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                <dt className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</dt>
                <dd className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('orgPortal.goalProgress', { defaultValue: 'Goal progress' })}</h3>
          <div className="mt-2.5 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            <Progress value={employee.goalProgress} />
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('orgPortal.monthlyTrend', { defaultValue: 'Monthly trend' })}</h3>
          <div className="mt-2.5 h-44 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
            {employee.monthlyTrend.length ? (
              <ResponsiveContainer>
                <LineChart data={employee.monthlyTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={38} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e`, 'Emissions']} />
                  <Line type="monotone" dataKey="emissions" stroke="#059669" strokeWidth= {2} isAnimationActive={!reduceMotion} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-xs text-slate-500">{t('orgPortal.noMonthlyTrend', { defaultValue: 'No monthly trend available.' })}</p>
            )}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{t('orgPortal.categoryBreakdown', { defaultValue: 'Category breakdown' })}</h3>
          <div className="mt-2.5 h-44 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
            {employee.categories.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={employee.categories} dataKey="emissions" nameKey="category" innerRadius="45%" outerRadius="75%">
                    {employee.categories.map((row, index) => (
                      <Cell key={row.category} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-xs text-slate-500">{t('orgPortal.noCategoryActivity', { defaultValue: 'No category activity available.' })}</p>
            )}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{t('orgPortal.recentActivities', { defaultValue: 'Recent activities' })}</h3>
          {employee.recent.length ? (
            <ul className="mt-2.5 space-y-2">
              {employee.recent.map((row) => (
                <li key={row.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{row.activity || row.category}</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{Number(row.emission || 0).toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {row.category} · {row.date}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t('orgPortal.noRecentActivities', { defaultValue: 'No recent activities available.' })}</p>
          )}
        </section>
      </motion.aside>
    </div>
  );
}

function EmployeeEditDialog({ employee, onClose, onSaved }) {
  const { t } = useTranslation();
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
      toast.success(t('orgPortal.employeeUpdated', { defaultValue: 'Employee details updated' }));
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || t('orgPortal.employeeUpdateFailed', { defaultValue: 'Unable to update employee' }));
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
              {t('orgPortal.editEmployee', { defaultValue: 'Edit employee' })}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.editEmployeeSubtitle', { defaultValue: 'Update organisation employee details.' })}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={saving} aria-label="Close edit employee" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.fullName', { defaultValue: 'Full name' })}</span>
            <input name="fullName" required value={form.fullName} onChange={change} className={control} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('auth.email', { defaultValue: 'Email' })}</span>
            <input name="email" type="email" required value={form.email} onChange={change} className={control} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.phone', { defaultValue: 'Phone' })}</span>
            <input name="phone" value={form.phone} onChange={change} className={control} placeholder="Optional" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.colDepartment', { defaultValue: 'Department' })}</span>
            <select name="department" value={form.department} onChange={change} className={control}>
              <option value="">Unassigned</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('adminPage.status', { defaultValue: 'Status' })}</span>
            <select name="status" value={form.status} onChange={change} className={control}>
              <option value="ACTIVE">{t('orgPortal.active', { defaultValue: 'Active' })}</option>
              <option value="INACTIVE">{t('orgPortal.inactive', { defaultValue: 'Inactive' })}</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? t('common.saving', { defaultValue: 'Saving…' }) : t('common.saveChanges', { defaultValue: 'Save changes' })}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function OrganisationEmployeesPage({ data, loading, error, onRetry, onReload = onRetry }) {
  const { t, i18n } = useTranslation();
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
    [editing, setEditing] = useState(null),
    [addingEmployee, setAddingEmployee] = useState(false);

  const [activeTab, setActiveTab] = useState('employees');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const list = await getPendingJoinRequests();
      setRequests(list || []);
    } catch (err) {
      console.error('Failed to load pending requests', err);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab, loadRequests]);

  const handleApprove = async (userId) => {
    try {
      await approveJoinRequest(userId);
      toast.success(t('orgPortal.requestApproved', { defaultValue: 'Employee request approved!' }));
      loadRequests();
      onReload();
    } catch (err) {
      toast.error(t('orgPortal.requestApproveFailed', { defaultValue: 'Failed to approve request' }));
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectJoinRequest(userId);
      toast.success(t('orgPortal.requestRejected', { defaultValue: 'Employee request rejected.' }));
      loadRequests();
    } catch (err) {
      toast.error(t('orgPortal.requestRejectFailed', { defaultValue: 'Failed to reject request' }));
    }
  };
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
            <h1 className="font-semibold">{t('orgPortal.employeesLoadError', { defaultValue: 'Employees could not be loaded' })}</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </section>
    );
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">{t('orgNav.peopleParticipation', { defaultValue: 'People and participation' })}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">{t('orgNav.employees', { defaultValue: 'Employees' })}</h1>
          <p className="mt-0.5 text-xs text-slate-500">{t('orgNav.employeesSubtitle', { defaultValue: 'Review employee sustainability participation using verified activity data.' })}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <Users className="h-3.5 w-3.5" />
            {employees.length.toLocaleString()} {t('orgNav.employees', { defaultValue: 'employees' })}
          </div>
          <button
            type="button"
            onClick={() => setAddingEmployee(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition-transform"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t('orgNav.addEmployee', { defaultValue: 'Add Employee' })}
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {t('orgNav.activeEmployees', { defaultValue: 'Active Employees' })}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {t('orgNav.joinRequests', { defaultValue: 'Join Requests' })}
          {requests.length > 0 && (
            <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'employees' ? (
        <>
          <section className={`${card} p-3.5`} aria-label="Employee filters">
            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
              <label className="relative">
                <span className="sr-only">{t('orgNav.searchEmployees', { defaultValue: 'Search employees' })}</span>
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  className={`${control} pl-8`}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t('orgNav.searchNameDept', { defaultValue: 'Search name or department' })}
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
                <option value="">{t('orgNav.allDepartments', { defaultValue: 'All departments' })}</option>
                {departments.map((value) => (
                  <option key={value} value={value}>{t(`departments.${value}`, { defaultValue: value })}</option>
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
                <option value="">{t('orgNav.allParticipation', { defaultValue: 'All participation' })}</option>
                <option value="active">{t('orgNav.participatingThisMonth', { defaultValue: 'Participating this month' })}</option>
                <option value="inactive">{t('orgNav.noActivityThisMonth', { defaultValue: 'No activity this month' })}</option>
              </select>
              <select
                aria-label="Sort employees"
                className={control}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="name">{t('orgNav.sortByName', { defaultValue: 'Sort by name' })}</option>
                <option value="footprint">{t('orgNav.highestFootprint', { defaultValue: 'Highest footprint' })}</option>
                <option value="activities">{t('orgNav.mostActivities', { defaultValue: 'Most activities' })}</option>
                <option value="goal">{t('orgNav.highestGoalProgress', { defaultValue: 'Highest goal progress' })}</option>
              </select>
            </div>
          </section>
          <section className={`${card} overflow-hidden p-0`}>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  <tr>
                    {[t('orgPortal.colEmployee', { defaultValue: 'Employee' }), t('orgPortal.colDepartment', { defaultValue: 'Department' }), t('orgPortal.colCarbonFootprint', { defaultValue: 'Carbon Footprint' }), t('orgPortal.colMonthlyChange', { defaultValue: 'Monthly Change' }), t('orgPortal.activitiesLogged', { defaultValue: 'Activities Logged' }), t('orgPortal.colGoalProgress', { defaultValue: 'Goal Progress' }), t('orgPortal.colParticipationStatus', { defaultValue: 'Participation Status' }), t('adminPage.actions', { defaultValue: 'Action' })].map((label) => (
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
                          <span className="font-bold text-slate-900 dark:text-white">{formatUserName(row.name, i18n.language)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{row.footprint.toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</td>
                      <td className={`px-3 py-2 font-bold ${row.monthlyChange === null ? 'text-slate-400' : row.monthlyChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {row.monthlyChange === null ? t('common.notAvailable', { defaultValue: 'Not available' }) : `${row.monthlyChange > 0 ? '+' : ''}${row.monthlyChange.toFixed(1)}%`}
                      </td>
                      <td className="px-3 py-2 font-semibold">{row.activitiesCount}</td>
                      <td className="px-3 py-2">
                        <div className="w-24">
                          <Progress value={row.goalProgress} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.participating ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                          {row.participating ? t('orgPortal.participating', { defaultValue: 'Participating' }) : t('orgPortal.noActivity', { defaultValue: 'No activity' })}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => setDrawer(row)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-50">
                            <Eye className="h-3 w-3" />
                            {t('adminPage.view', { defaultValue: 'View' })}
                          </button>
                          <button type="button" onClick={() => setEditing(row)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50">
                            <Pencil className="h-3 w-3" />
                            {t('adminPage.edit', { defaultValue: 'Edit' })}
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
                      <h2 className="truncate text-xs font-bold text-slate-900 dark:text-white">{formatUserName(row.name, i18n.language)}</h2>
                      <p className="text-[11px] text-slate-500">{row.department ? t(`departments.${row.department}`, { defaultValue: row.department }) : t('departments.Unassigned', { defaultValue: 'Unassigned' })}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.participating ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{row.participating ? t('orgPortal.active', { defaultValue: 'Active' }) : t('orgPortal.noActivity', { defaultValue: 'No activity' })}</span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-[10px] text-slate-500 uppercase">{t('orgPortal.colCarbonFootprint', { defaultValue: 'Footprint' })}</dt>
                      <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{row.footprint.toLocaleString()} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-slate-500 uppercase">{t('orgPortal.activitiesLogged', { defaultValue: 'Activities' })}</dt>
                      <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{row.activitiesCount}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">
                    <Progress value={row.goalProgress} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setDrawer(row)} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold">
                      <Eye className="h-3.5 w-3.5" />
                      {t('adminPage.view', { defaultValue: 'View' })}
                    </button>
                    <button type="button" onClick={() => setEditing(row)} className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                      <Pencil className="h-3.5 w-3.5" />
                      {t('adminPage.edit', { defaultValue: 'Edit' })}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!visible.length && <Empty />}
            {!!visible.length && (
              <footer className="flex flex-col gap-2.5 border-t border-slate-100 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {t('common.showing', { defaultValue: 'Showing' })} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} {t('common.of', { defaultValue: 'of' })} {filtered.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Previous employee page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-1.5 disabled:opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {t('common.page', { defaultValue: 'Page' })} {page} {t('common.of', { defaultValue: 'of' })} {pages}
                  </span>
                  <button type="button" aria-label="Next employee page" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-1.5 disabled:opacity-40">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </footer>
            )}
          </section>
        </>
      ) : (
        <section className={card} aria-label="Pending join requests">
          {requestsLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium animate-pulse">
              {t('common.loading', { defaultValue: 'Loading requests…' })}
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {t('orgPortal.noPendingRequests', { defaultValue: 'No pending join requests available.' })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">{t('orgPortal.employeeName', { defaultValue: 'Employee Name' })}</th>
                    <th className="px-4 py-3">{t('auth.email', { defaultValue: 'Email' })}</th>
                    <th className="px-4 py-3">{t('orgPortal.departmentJobTitle', { defaultValue: 'Department / Job Title' })}</th>
                    <th className="px-4 py-3 text-right">{t('adminPage.actions', { defaultValue: 'Actions' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{r.email}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {r.department || 'Unassigned'}
                        </span>
                        {r.jobTitle && (
                          <span className="block text-[10px] text-slate-400">
                            {r.jobTitle}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          {t('orgPortal.approve', { defaultValue: 'Approve' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(r.id)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          {t('orgPortal.reject', { defaultValue: 'Reject' })}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {drawer && <EmployeeDrawer employee={drawer} onClose={() => setDrawer(null)} />}
      {editing && <EmployeeEditDialog employee={editing} onClose={() => setEditing(null)} onSaved={onReload} />}
      {addingEmployee && <AddEmployeeModal onClose={() => setAddingEmployee(false)} onSaved={onReload} />}
    </div>
  );
}
