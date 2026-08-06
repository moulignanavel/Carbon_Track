import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertCircle, CalendarClock, CheckCircle2, Eye, Leaf, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import { createOrganisationGoal, deleteOrganisationGoal, updateOrganisationGoal } from '@/api/organisationApi';
import EcoLottie from '@/components/organisation/EcoLottie';

const EMPTY_DATA = {};
const plantAnimation = () => import('@/assets/animations/eco-plant.json');
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ title: '', description: '', category: '', period: 'monthly', targetKg: '', currentKg: 0, startDate: today(), endDate: '', status: 'ACTIVE', responsibleDepartment: '' });
const progressOf = (goal) => {
  const target = Number(goal.targetKg || 0),
    current = Number(goal.currentKg || 0);
  return target > 0 ? Math.min(100, Math.max(0, (current * 100) / target)) : 0;
};
function TreeFallback() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <path d="M58 101V61" stroke="#8b5e3c" strokeWidth="9" strokeLinecap="round" />
      <circle cx="60" cy="43" r="28" fill="#4ade80" />
      <circle cx="40" cy="53" r="18" fill="#22c55e" />
      <circle cx="79" cy="55" r="19" fill="#16a34a" />
    </svg>
  );
}
function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading goals">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-3.5 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
function Empty() {
  return (
    <section className={`${card} grid min-h-60 place-items-center text-center`}>
      <div>
        <Leaf className="mx-auto h-7 w-7 text-emerald-500" />
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">No goals match these filters</h2>
        <p className="mt-0.5 text-xs text-slate-500">Create a goal or change the selected filters.</p>
      </div>
    </section>
  );
}
function Progress({ goal }) {
  const progress = progressOf(goal);
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-500">
          {Number(goal.currentKg || 0).toLocaleString()} of {Number(goal.targetKg || 0).toLocaleString()} kg CO₂e
        </span>
        <strong className="font-bold">{progress.toFixed(0)}%</strong>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
function Status({ value }) {
  const status = String(value || 'ACTIVE').toUpperCase();
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        status === 'ACHIEVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : status === 'MISSED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
      }`}
    >
      {status}
    </span>
  );
}

function GoalForm({ goal, departments, categories, onClose, onSaved }) {
  const reduceMotion = useReducedMotion(),
    closeRef = useRef(null),
    [form, setForm] = useState(goal ? { ...goal } : blank()),
    [saving, setSaving] = useState(false),
    [errors, setErrors] = useState({});
  useEffect(() => {
    closeRef.current?.focus();
    const handle = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose, saving]);
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Goal title is required';
    if (!form.category.trim()) next.category = 'Category is required';
    if (!(Number(form.targetKg) > 0)) next.targetKg = 'Target must be greater than zero';
    if (Number(form.currentKg) < 0) next.currentKg = 'Current progress cannot be negative';
    if (!form.startDate) next.startDate = 'Start date is required';
    if (!form.endDate) next.endDate = 'Deadline is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) next.endDate = 'Deadline must be on or after the start date';
    setErrors(next);
    return !Object.keys(next).length;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    const payload = { ...form, targetKg: Number(form.targetKg), currentKg: Number(form.currentKg) };
    try {
      if (goal?.id) await updateOrganisationGoal(goal.id, payload);
      else await createOrganisationGoal(payload);
      toast.success(goal?.id ? 'Goal updated' : 'Goal created');
      await onSaved({ completed: String(payload.status).toUpperCase() === 'ACHIEVED' && String(goal?.status).toUpperCase() !== 'ACHIEVED' });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Unable to save goal');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <motion.form
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-form-title"
        className="my-6 w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5"
      >
        <div className="flex justify-between gap-3">
          <div>
            <h2 id="goal-form-title" className="text-base font-bold text-slate-950 dark:text-white">
              {goal ? 'Edit goal' : 'Create goal'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Set measurable organisation sustainability progress.</p>
          </div>
          <button ref={closeRef} type="button" disabled={saving} onClick={onClose} aria-label="Close goal form" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Goal title</span>
            <input name="title" value={form.title} onChange={change} className={control} />
            {errors.title && <span className="mt-1 block text-[11px] text-rose-600">{errors.title}</span>}
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Description</span>
            <textarea name="description" value={form.description || ''} onChange={change} rows="2" className={`${control} h-auto py-2`} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Category</span>
            <input name="category" list="goal-categories" value={form.category} onChange={change} className={control} />
            <datalist id="goal-categories">
              {categories.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            {errors.category && <span className="mt-1 block text-[11px] text-rose-600">{errors.category}</span>}
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Period</span>
            <select name="period" value={form.period} onChange={change} className={control}>
              {['daily', 'weekly', 'monthly', 'quarterly', 'annual'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Target (kg CO₂e)</span>
            <input name="targetKg" type="number" min="0.01" step="0.01" value={form.targetKg} onChange={change} className={control} />
            {errors.targetKg && <span className="mt-1 block text-[11px] text-rose-600">{errors.targetKg}</span>}
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Current progress (kg CO₂e)</span>
            <input name="currentKg" type="number" min="0" step="0.01" value={form.currentKg} onChange={change} className={control} />
            {errors.currentKg && <span className="mt-1 block text-[11px] text-rose-600">{errors.currentKg}</span>}
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Start date</span>
            <input name="startDate" type="date" value={form.startDate} onChange={change} className={control} />
            {errors.startDate && <span className="mt-1 block text-[11px] text-rose-600">{errors.startDate}</span>}
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Deadline</span>
            <input name="endDate" type="date" value={form.endDate} onChange={change} className={control} />
            {errors.endDate && <span className="mt-1 block text-[11px] text-rose-600">{errors.endDate}</span>}
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Status</span>
            <select name="status" value={form.status} onChange={change} className={control}>
              <option value="ACTIVE">Active</option>
              <option value="ACHIEVED">Achieved</option>
              <option value="MISSED">Missed</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Responsible department</span>
            <select name="responsibleDepartment" value={form.responsibleDepartment || ''} onChange={change} className={control}>
              <option value="">Not assigned</option>
              {departments.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            {saving ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
function GoalDetails({ goal, onClose, onEdit }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const handle = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} role="dialog" aria-modal="true" aria-labelledby="goal-details-title" className="h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5">
        <div className="flex justify-between">
          <div>
            <Status value={goal.status} />
            <h2 id="goal-details-title" className="mt-2.5 text-base font-bold text-slate-950 dark:text-white">
              {goal.title}
            </h2>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close goal details" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{goal.description || 'No description provided.'}</p>
        <div className="mt-4">
          <Progress goal={goal} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2.5">
          {[
            ['Target', `${goal.targetKg} kg CO₂e`],
            ['Current', `${goal.currentKg || 0} kg CO₂e`],
            ['Start date', goal.startDate],
            ['Deadline', goal.endDate],
            ['Category', goal.category],
            ['Period', goal.period],
            ['Responsible department', goal.responsibleDepartment || 'Not assigned'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
              <dt className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</dt>
              <dd className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onEdit} className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">
          <Pencil className="h-3.5 w-3.5" />
          Edit goal
        </button>
      </motion.aside>
    </div>
  );
}

export default function OrganisationGoalsPage({ data, loading, error, onRetry, onReload = onRetry }) {
  const source = data || EMPTY_DATA,
    goals = useMemo(() => source.goals || [], [source.goals]),
    employees = useMemo(() => source.employees || [], [source.employees]),
    logs = useMemo(() => source.activityLogs || [], [source.activityLogs]),
    reduceMotion = useReducedMotion();
  const [status, setStatus] = useState(''),
    [department, setDepartment] = useState(''),
    [category, setCategory] = useState(''),
    [form, setForm] = useState(null),
    [details, setDetails] = useState(null),
    [deleting, setDeleting] = useState(null),
    [completion, setCompletion] = useState(false),
    [deletingBusy, setDeletingBusy] = useState(false);
  const departments = useMemo(() => [...new Set(employees.map((row) => row.department).filter(Boolean))].sort(), [employees]),
    categories = useMemo(() => [...new Set([...goals.map((row) => row.category), ...logs.map((row) => row.category)].filter(Boolean))].sort(), [goals, logs]);
  const filtered = goals.filter((goal) => (!status || goal.status === status) && (!department || goal.responsibleDepartment === department) && (!category || goal.category === category));
  const active = goals.filter((goal) => goal.status === 'ACTIVE'),
    completed = goals.filter((goal) => goal.status === 'ACHIEVED'),
    upcoming = active.filter((goal) => goal.endDate && goal.endDate >= today()).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    completionRate = goals.length ? (completed.length * 100) / goals.length : 0;
  const saved = async (result) => {
    await onReload();
    if (result.completed) {
      setCompletion(true);
      setTimeout(() => setCompletion(false), 2600);
    }
  };
  const confirmDelete = async () => {
    if (!deleting || deletingBusy) return;
    setDeletingBusy(true);
    try {
      await deleteOrganisationGoal(deleting.id);
      toast.success('Goal deleted');
      setDeleting(null);
      await onReload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to delete goal');
    } finally {
      setDeletingBusy(false);
    }
  };
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} p-4 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Goals could not be loaded</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            Retry
          </button>
        </div>
      </section>
    );
  const summaries = [
    ['Active Goals', active.length, Target],
    ['Completed Goals', completed.length, CheckCircle2],
    ['Upcoming Deadlines', upcoming.length, CalendarClock],
    ['Overall Completion Rate', `${completionRate.toFixed(1)}%`, CheckCircle2],
  ];
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Organisation targets</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Goals</h1>
          <p className="mt-0.5 text-xs text-slate-500">Create, track and complete measurable sustainability goals.</p>
        </div>
        <button type="button" onClick={() => setForm(blank())} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" />
          Create Goal
        </button>
      </header>
      <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map(([label, value, Icon], index) => (
          <motion.article key={label} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={card}>
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{value}</p>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </motion.article>
        ))}
      </section>
      {upcoming.length > 0 && (
        <section className={card}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Upcoming Deadlines</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {upcoming.slice(0, 4).map((goal) => (
              <button key={goal.id} onClick={() => setDetails(goal)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {goal.title} · {goal.endDate}
              </button>
            ))}
          </div>
        </section>
      )}
      <section className={card} aria-label="Goal filters">
        <div className="grid gap-2.5 sm:grid-cols-3">
          <select aria-label="Filter goals by status" className={control} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="MISSED">Missed</option>
          </select>
          <select aria-label="Filter goals by department" className={control} value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">All departments</option>
            {departments.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select aria-label="Filter goals by category" className={control} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </section>
      {filtered.length ? (
        <section className="grid gap-3.5 lg:grid-cols-2">
          {filtered.map((goal) => (
            <article key={goal.id} className={card}>
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <Status value={goal.status} />
                  <h2 className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{goal.title}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{goal.responsibleDepartment || 'Not assigned'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setDetails(goal)} aria-label={`View ${goal.title}`} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setForm({ ...goal })} aria-label={`Edit ${goal.title}`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleting(goal)} aria-label={`Delete ${goal.title}`} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3.5">
                <Progress goal={goal} />
              </div>
              <dl className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Start date</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.startDate}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Deadline</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.endDate}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Target value</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.targetKg} kg CO₂e</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">Category</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.category}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      ) : (
        <Empty />
      )}
      {form && <GoalForm goal={form.id ? form : null} departments={departments} categories={categories} onClose={() => setForm(null)} onSaved={saved} />}
      {details && (
        <GoalDetails
          goal={details}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setForm({ ...details });
            setDetails(null);
          }}
        />
      )}
      {deleting && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-goal-title" className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5">
            <h2 id="delete-goal-title" className="text-base font-bold text-slate-950 dark:text-white">
              Delete goal?
            </h2>
            <p className="mt-1 text-xs text-slate-500">“{deleting.title}” will be permanently removed.</p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button disabled={deletingBusy} onClick={() => setDeleting(null)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">
                Cancel
              </button>
              <button disabled={deletingBusy} onClick={confirmDelete} className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                {deletingBusy ? 'Deleting…' : 'Delete goal'}
              </button>
            </div>
          </div>
        </div>
      )}
      {completion && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/30 pointer-events-none" aria-live="polite">
          <div className="rounded-xl bg-white p-5 text-center shadow-2xl dark:bg-slate-900">
            <EcoLottie animationData={plantAnimation} loop={false} className="mx-auto h-28 w-28" fallback={<TreeFallback />} reducedMotionFallback={<TreeFallback />} />
            <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">Goal completed</p>
          </div>
        </div>
      )}
    </div>
  );
}
