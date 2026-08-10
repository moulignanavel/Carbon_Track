import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertCircle, CalendarClock, CheckCircle2, Eye, Leaf, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import { createOrganisationGoal, deleteOrganisationGoal, updateOrganisationGoal } from '@/api/organisationApi';
import EcoLottie from '@/components/organisation/EcoLottie';
import { formatGoalTitle } from '@/utils/formatters';

const EMPTY_DATA = {};
const plantAnimation = () => import('@/assets/animations/eco-plant.json');
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ title: '', description: '', category: 'all', period: 'monthly', targetKg: '', currentKg: 0, startDate: today(), endDate: '', status: 'ACTIVE', responsibleDepartment: '' });
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
  const { t } = useTranslation();
  return (
    <section className={`${card} grid min-h-60 place-items-center text-center`}>
      <div>
        <Leaf className="mx-auto h-7 w-7 text-emerald-500" />
        <h2 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">{t('orgPortal.noGoalsMatch', { defaultValue: 'No goals match these filters' })}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.createGoalFilter', { defaultValue: 'Create a goal or change the selected filters.' })}</p>
      </div>
    </section>
  );
}
function Progress({ goal }) {
  const { t } = useTranslation();
  const progress = progressOf(goal);
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold">
        <span>{t('orgNav.progress', { defaultValue: 'Progress' })}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
function Status({ value }) {
  const { t } = useTranslation();
  const isAchieved = value === 'ACHIEVED',
    isMissed = value === 'MISSED';
  const label = isAchieved
    ? t('orgPortal.achieved', { defaultValue: 'Achieved' })
    : isMissed
      ? t('orgPortal.missed', { defaultValue: 'Missed' })
      : t('orgPortal.active', { defaultValue: 'Active' });
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${isAchieved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : isMissed ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
      {label}
    </span>
  );
}

function GoalForm({ goal, departments, categories, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(goal || blank());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const change = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: t('orgPortal.goalTitleRequired', { defaultValue: 'Title is required' }) });
      return;
    }
    setSaving(true);
    try {
      if (goal?.id) {
        await updateOrganisationGoal(goal.id, form);
        toast.success(t('orgPortal.goalUpdated', { defaultValue: 'Goal updated' }));
      } else {
        await createOrganisationGoal(form);
        toast.success(t('orgPortal.goalCreated', { defaultValue: 'Goal created' }));
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || t('orgPortal.goalSaveFailed', { defaultValue: 'Failed to save goal' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-950 dark:text-white">{goal?.id ? t('orgPortal.editGoal', { defaultValue: 'Edit Goal' }) : t('orgPortal.createGoal', { defaultValue: 'Create Goal' })}</h2>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.goalTitle', { defaultValue: 'Goal Title' })}</span>
            <input name="title" required value={form.title} onChange={change} className={control} />
            {errors.title && <span className="text-[10px] text-rose-500">{errors.title}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.description', { defaultValue: 'Description' })}</span>
            <input name="description" value={form.description} onChange={change} className={control} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.targetValue', { defaultValue: 'Target (kg CO₂e)' })}</span>
              <input type="number" name="targetKg" required value={form.targetKg} onChange={change} className={control} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.responsibleDept', { defaultValue: 'Department' })}</span>
              <select name="responsibleDepartment" value={form.responsibleDepartment} onChange={change} className={control}>
                <option value="">{t('orgPortal.allDepartments', { defaultValue: 'All departments' })}</option>
                {departments.map((d) => <option key={d} value={d}>{t(`departments.${d}`, { defaultValue: d })}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.startDate', { defaultValue: 'Start Date' })}</span>
              <input type="date" name="startDate" value={form.startDate} onChange={change} className={control} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgPortal.deadline', { defaultValue: 'Deadline' })}</span>
              <input type="date" name="endDate" value={form.endDate} onChange={change} className={control} />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">{t('common.cancel', { defaultValue: 'Cancel' })}</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? t('common.saving', { defaultValue: 'Saving…' }) : t('common.save', { defaultValue: 'Save' })}</button>
        </div>
      </form>
    </div>
  );
}
function GoalDetails({ goal, onClose, onEdit }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">{goal.title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{goal.description || t('orgPortal.noDescription', { defaultValue: 'No description provided.' })}</p>
        <div className="mt-4 space-y-2">
          <Progress goal={goal} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">{t('common.close', { defaultValue: 'Close' })}</button>
          <button onClick={onEdit} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">{t('adminPage.edit', { defaultValue: 'Edit' })}</button>
        </div>
      </div>
    </div>
  );
}

export default function OrganisationGoalsPage({ data, loading, error, onRetry, onReload = onRetry }) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const source = data || EMPTY_DATA;
  const goals = useMemo(() => source.goals || [], [source.goals]);
  const employees = useMemo(() => source.employees || [], [source.employees]);
  const departments = useMemo(() => [...new Set(employees.map((row) => row.department || 'Unassigned'))].sort(), [employees]);
  const categories = useMemo(() => ['all', 'transport', 'electricity', 'food', 'shopping'], []);

  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [form, setForm] = useState(null);
  const [details, setDetails] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [completion, setCompletion] = useState(false);

  const active = goals.filter((g) => g.status === 'ACTIVE');
  const completed = goals.filter((g) => g.status === 'ACHIEVED');
  const upcoming = goals.filter((g) => g.endDate && new Date(g.endDate) >= new Date());
  const completionRate = goals.length ? (completed.length * 100) / goals.length : 0;

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (status && g.status !== status) return false;
      if (department && g.responsibleDepartment !== department) return false;
      if (category && g.category !== category) return false;
      return true;
    });
  }, [goals, status, department, category]);

  const saved = async () => {
    await onReload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await deleteOrganisationGoal(deleting.id);
      toast.success(t('orgPortal.goalDeleted', { defaultValue: 'Goal deleted' }));
      setDeleting(null);
      await onReload();
    } catch (err) {
      toast.error(err.response?.data?.error || t('orgPortal.goalDeleteFailed', { defaultValue: 'Unable to delete goal' }));
    } finally {
      setDeletingBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <section className={`${card} p-4 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">{t('orgPortal.goalsLoadError', { defaultValue: 'Goals could not be loaded' })}</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </section>
    );
  }

  const summaries = [
    [t('orgNav.activeGoals', { defaultValue: 'Active Goals' }), active.length, Target],
    [t('orgNav.completedGoals', { defaultValue: 'Completed Goals' }), completed.length, CheckCircle2],
    [t('orgNav.upcomingDeadlines', { defaultValue: 'Upcoming Deadlines' }), upcoming.length, CalendarClock],
    [t('orgNav.overallCompletionRate', { defaultValue: 'Overall Completion Rate' }), `${completionRate.toFixed(1)}%`, CheckCircle2],
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">
            {t('orgNav.targets', { defaultValue: 'Organisation targets' })}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {t('orgNav.goals', { defaultValue: 'Goals' })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('orgNav.goalsSubtitle', { defaultValue: 'Create, track and complete measurable sustainability goals.' })}
          </p>
        </div>
        <button type="button" onClick={() => setForm(blank())} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" />
          {t('orgNav.createGoal', { defaultValue: 'Create Goal' })}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{t('orgNav.upcomingDeadlines', { defaultValue: 'Upcoming Deadlines' })}</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {upcoming.slice(0, 4).map((goal) => (
              <button key={goal.id} onClick={() => setDetails(goal)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {formatGoalTitle(goal.title, i18n.language)} · {goal.endDate}
              </button>
            ))}
          </div>
        </section>
      )}
      <section className={card} aria-label="Goal filters">
        <div className="grid gap-2.5 sm:grid-cols-3">
          <select aria-label="Filter goals by status" className={control} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{t('orgNav.allStatuses', { defaultValue: 'All statuses' })}</option>
            <option value="ACTIVE">{t('orgPortal.active', { defaultValue: 'Active' })}</option>
            <option value="ACHIEVED">{t('orgPortal.achieved', { defaultValue: 'Achieved' })}</option>
            <option value="MISSED">{t('orgPortal.missed', { defaultValue: 'Missed' })}</option>
          </select>
          <select aria-label="Filter goals by department" className={control} value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">{t('orgPortal.allDepartments', { defaultValue: 'All departments' })}</option>
            {departments.map((value) => (
              <option key={value} value={value}>
                {t(`departments.${value}`, { defaultValue: value })}
              </option>
            ))}
          </select>
          <select aria-label="Filter goals by category" className={control} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('orgNav.allCategories', { defaultValue: 'All categories' })}</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {t(`categories.${value}`, { defaultValue: value })}
              </option>
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
                  <h2 className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{formatGoalTitle(goal.title, i18n.language)}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {goal.responsibleDepartment
                      ? t(`departments.${goal.responsibleDepartment}`, { defaultValue: goal.responsibleDepartment })
                      : t('orgPortal.notAssigned', { defaultValue: 'Not assigned' })}
                  </p>
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
                  <dt className="text-[10px] text-slate-500 uppercase">{t('orgNav.startDate', { defaultValue: 'Start date' })}</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.startDate}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">{t('orgNav.deadline', { defaultValue: 'Deadline' })}</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.endDate}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">{t('orgNav.targetValue', { defaultValue: 'Target value' })}</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{goal.targetKg} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase">{t('orgNav.category', { defaultValue: 'Category' })}</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {goal.category ? t(`categories.${goal.category}`, { defaultValue: goal.category }) : t('activitiesPage.categories.all', { defaultValue: 'All' })}
                  </dd>
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
              {t('orgPortal.deleteGoalConfirmTitle', { defaultValue: 'Delete goal?' })}
            </h2>
            <p className="mt-1 text-xs text-slate-500">“{deleting.title}” {t('orgPortal.permanentlyRemoved', { defaultValue: 'will be permanently removed.' })}</p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button disabled={deletingBusy} onClick={() => setDeleting(null)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button disabled={deletingBusy} onClick={confirmDelete} className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                {deletingBusy ? t('common.deleting', { defaultValue: 'Deleting…' }) : t('orgPortal.deleteGoal', { defaultValue: 'Delete goal' })}
              </button>
            </div>
          </div>
        </div>
      )}
      {completion && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/30 pointer-events-none" aria-live="polite">
          <div className="rounded-xl bg-white p-5 text-center shadow-2xl dark:bg-slate-900">
            <EcoLottie animationData={plantAnimation} loop={false} className="mx-auto h-28 w-28" fallback={<TreeFallback />} reducedMotionFallback={<TreeFallback />} />
            <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('orgPortal.goalCompleted', { defaultValue: 'Goal completed' })}</p>
          </div>
        </div>
      )}
    </div>
  );
}
