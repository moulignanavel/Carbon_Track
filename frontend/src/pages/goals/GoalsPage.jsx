/**
 * GoalsPage.jsx — Goal Tracking Module
 * ─────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page header + summary KPI strip
 *   2. Goal cards grid (progress, circular meter, timeline)
 *   3. Create / Edit goal modal  (RHF + Zod)
 *   4. Delete confirmation modal
 *   5. Empty state
 *
 * Features:
 *   ✓ Create Goal   (full form with validation)
 *   ✓ Edit Goal     (pre-fills form with existing values)
 *   ✓ Delete Goal   (confirmation dialog)
 *   ✓ Goal Progress (circular ring + gradient bar)
 *   ✓ Timeline      (per-goal area chart)
 *   ✓ Target %      (live calculation)
 *   ✓ Remaining     (kg CO₂e left)
 *   ✓ Progress Cards (4-metric strip)
 *   ✓ Responsive    (1→2→3 col grid)
 */

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useForm }           from 'react-hook-form';
import { zodResolver }       from '@hookform/resolvers/zod';
import toast                 from 'react-hot-toast';
import {
  Target, Plus, TrendingDown, CheckCircle2,
  AlertTriangle, XCircle, Pencil, Trash2,
  CalendarDays, Leaf, BarChart2, Flag,
  ChevronDown, ChevronUp,
} from 'lucide-react';

import { useGoals }      from '@/context/GoalContext';
import { goalSchema }    from '@/utils/validators';
import { formatEmission, formatDate, capitalize } from '@/utils/formatters';
import { CATEGORY_META } from '@/constants/activities';
import { COLORS }        from '@/constants/theme';

import {
  Button, Card, Badge, Modal,
  Input, Select, EmptyState,
  Alert, CircularProgress, ProgressBar,
} from '@/components/ui';
import GoalTimelineChart from '@/components/charts/GoalTimelineChart';
import GoalTrackingWidget from '@/components/goals/GoalTrackingWidget';

/* ══════════════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════════════ */

const PERIOD_OPTIONS = [
  { value: 'daily',     label: 'Daily'     },
  { value: 'weekly',    label: 'Weekly'    },
  { value: 'monthly',   label: 'Monthly'   },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual',    label: 'Annual'    },
];

const CATEGORY_OPTIONS = [
  { value: 'all',         label: '🌍  All Categories'  },
  { value: 'transport',   label: '🚗  Transport'        },
  { value: 'electricity', label: '⚡  Electricity'     },
  { value: 'food',        label: '🍽️  Food'             },
  { value: 'shopping',    label: '🛍️  Shopping'         },
  { value: 'energy',      label: '🔥  Home Energy'      },
];

const today = new Date().toISOString().split('T')[0];

/* ── derive goal status ──────────────────────────────────────── */
function getGoalStatus(goal) {
  const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  if (pct >= 100) return { key: 'exceeded', labelKey: 'goals.overBudget', variant: 'red',    icon: XCircle,      barColor: 'red'    };
  if (pct >= 85)  return { key: 'warning',  labelKey: 'goals.watchOut',   variant: 'yellow', icon: AlertTriangle, barColor: 'yellow' };
  return             { key: 'on-track',  labelKey: 'goals.onTrack',    variant: 'green',  icon: CheckCircle2, barColor: 'green'  };
}

/* ── category accent colour ──────────────────────────────────── */
function getCatColor(category) {
  if (category === 'all') return COLORS.green[500];
  return CATEGORY_META[category]?.color ?? COLORS.green[500];
}

/* ── days remaining in goal period ──────────────────────────── */
function daysLeft(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86_400_000);
  return diff;
}

const CAT_KEY_MAP = {
  transport:   'activitiesPage.catTransport',
  electricity: 'activitiesPage.catElectricity',
  food:        'activitiesPage.catFood',
  shopping:    'activitiesPage.catShopping',
  energy:      'activitiesPage.catEnergy',
};

function formatGoalTitle(title, category, t) {
  const catKey = (category || '').toLowerCase();
  const titleKey = (title || '').toLowerCase();

  if (CAT_KEY_MAP[titleKey]) return t(CAT_KEY_MAP[titleKey]);
  if (CAT_KEY_MAP[catKey]) return t(CAT_KEY_MAP[catKey]);
  return title;
}

function formatCategoryLabel(category, catMeta, t) {
  const key = (category || '').toLowerCase();
  if (key === 'all') return t('goals.allCategories', { defaultValue: 'All Categories' });
  if (CAT_KEY_MAP[key]) return t(CAT_KEY_MAP[key]);
  return catMeta?.label || category;
}

function formatPeriodLabel(period, t) {
  const p = (period || '').toLowerCase();
  const map = {
    daily: t('goals.periodDaily', { defaultValue: 'Daily' }),
    weekly: t('goals.periodWeekly', { defaultValue: 'Weekly' }),
    monthly: t('goals.periodMonthly', { defaultValue: 'Monthly' }),
    quarterly: t('goals.periodQuarterly', { defaultValue: 'Quarterly' }),
    annual: t('goals.periodAnnual', { defaultValue: 'Annual' }),
  };
  return map[p] || capitalize(period);
}

/* ══════════════════════════════════════════════════════════════
   Goal Card — displays one goal with progress, controls, timeline
   ══════════════════════════════════════════════════════════════ */
function GoalCard({ goal, onEdit, onDelete, history }) {
  const { t } = useTranslation();
  const status       = getGoalStatus(goal);
  const pct          = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  const remaining    = Math.max(0, goal.target - goal.current);
  const daysLeftVal  = daysLeft(goal.endDate);
  const catMeta      = goal.category !== 'all' ? CATEGORY_META[goal.category] : null;
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = status.icon;
  const displayTitle = formatGoalTitle(goal.title, goal.category, t);

  return (
    <Card hover className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {displayTitle}
            </h3>
            <Badge variant={status.variant} size="xs" dot>
              {t(status.labelKey)}
            </Badge>
            {goal.organisationManaged && (
              <Badge variant="purple" size="xs">
                🏢 Organisation Goal
              </Badge>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        {/* Circular progress */}
        <div className="shrink-0">
          <CircularProgress
            value={pct}
            size={72}
            strokeWidth={6}
            color={status.barColor}
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {Math.min(100, Math.round(pct))}%
            </span>
          </CircularProgress>
        </div>
      </div>

      {/* Category + period badges */}
      <div className="flex flex-wrap gap-2">
        {catMeta && (
          <Badge variant="slate" size="sm">
            {catMeta.emoji}  {formatCategoryLabel(goal.category, catMeta, t)}
          </Badge>
        )}
        {goal.category === 'all' && (
          <Badge variant="green" size="sm">🌍  {t('goals.allCategories', { defaultValue: 'All Categories' })}</Badge>
        )}
        <Badge variant="slate" size="sm">
          {formatPeriodLabel(goal.period, t)}
        </Badge>
      </div>

      {/* Progress bar + metrics row */}
      <div className="space-y-2">
        <ProgressBar
          value={goal.current}
          max={goal.target}
          size="md"
          color={status.barColor}
          variant="gradient"
          showValue
          label={`${formatEmission(goal.current)} ${t('goals.of')} ${formatEmission(goal.target)}`}
        />
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-slate-400">{t('goals.remaining')}</p>
            <p className={`font-bold ${
              remaining > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatEmission(remaining)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">{t('goals.daysLeft')}</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {daysLeftVal != null ? (daysLeftVal < 0 ? t('dashboard.ended') : `${daysLeftVal}d`) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">{t('goals.period')}</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {formatDate(goal.startDate)} – {formatDate(goal.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {history && history.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>{t('goals.progressTimeline', { defaultValue: 'Progress Timeline' })}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {expanded && (
            <div className="mt-3">
              <GoalTimelineChart
                data={history}
                target={goal.target}
                color={getCatColor(goal.category)}
                height={140}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
          onClick={() => onEdit(goal)}
          className="flex-1"
        >
          {t('goals.edit', { defaultValue: 'Edit' })}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(goal.id)}
          className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

/* ── date range calculation by period ────────────────────────── */
function getPeriodDates(period) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (period === 'weekly') {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diffToMonday);
    end.setDate(diffToMonday + 6);
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), quarter * 3, 1);
    end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  } else if (period === 'annual') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31);
  } else {
    // daily / custom
    start = now;
    end = now;
  }

  const toDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  return {
    start: toDateString(start),
    end: toDateString(end),
  };
}

/* ══════════════════════════════════════════════════════════════
   Goal Form Modal — create / edit with RHF + Zod
   ══════════════════════════════════════════════════════════════ */
function GoalFormModal({ isOpen, onClose, onSave, editingGoal }) {
  const defaultDates = getPeriodDates('monthly');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title:       '',
      description: '',
      category:    'all',
      period:      'monthly',
      target:      '',
      startDate:   defaultDates.start,
      endDate:     defaultDates.end,
    },
  });

  const selectedPeriod = watch('period');

  // Sync dates when period selection changes (only if creating a new goal)
  useEffect(() => {
    if (!editingGoal && selectedPeriod) {
      const dates = getPeriodDates(selectedPeriod);
      setValue('startDate', dates.start);
      setValue('endDate', dates.end);
    }
  }, [selectedPeriod, setValue, editingGoal]);

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        const formatDateToInput = (d) => {
          if (!d) return today;
          if (Array.isArray(d)) {
            const year = d[0];
            const month = String(d[1]).padStart(2, '0');
            const day = String(d[2]).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          if (typeof d === 'string') {
            return d.split('T')[0];
          }
          return today;
        };

        reset({
          title:       editingGoal.title || '',
          description: editingGoal.description || '',
          category:    editingGoal.category || 'all',
          period:      editingGoal.period || 'monthly',
          target:      editingGoal.target ?? '',
          startDate:   formatDateToInput(editingGoal.startDate),
          endDate:     formatDateToInput(editingGoal.endDate),
        });
      } else {
        const defaultDates = getPeriodDates('monthly');
        reset({
          title:       '',
          description: '',
          category:    'all',
          period:      'monthly',
          target:      '',
          startDate:   today,
          endDate:     today,
        });
      }
    }
  }, [editingGoal, isOpen, reset]);

  const endDate = watch('endDate');

  const handleSave = async (data) => {
    await onSave(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
      description="Set a carbon reduction target and track your progress."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="goal-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </>
      }
    >
      <form
        id="goal-form"
        onSubmit={handleSubmit(handleSave)}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Goal Title"
          placeholder="e.g. Monthly Carbon Budget"
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Description"
          placeholder="Optional context for this goal"
          maxLength={200}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
            {...register('category')}
          />
          <Select
            label="Period"
            required
            options={PERIOD_OPTIONS}
            error={errors.period?.message}
            {...register('period')}
          />
        </div>

        <Input
          label="Target (kg CO₂e)"
          type="number"
          min="0"
          step="0.1"
          placeholder="150"
          required
          error={errors.target?.message}
          {...register('target', { valueAsNumber: true })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            max={endDate || undefined}
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            min={watch('startDate')}
            required
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>
      </form>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   Delete Confirmation Modal
   ══════════════════════════════════════════════════════════════ */
function DeleteConfirmModal({ isOpen, onClose, onConfirm, goalTitle }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Goal"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep Goal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{goalTitle}"</span>? This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function GoalsPage() {
  const { t } = useTranslation();
  const { goals, stats, fetchGoals, addGoal: addGoalContext, updateGoal, deleteGoal: deleteGoalContext } = useGoals();
  const location = useLocation();

  const [formOpen,      setFormOpen]      = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [editingGoal,   setEditingGoal]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  // GoalContext performs the initial and activity-triggered loads. This page
  // only adds a periodic refresh, avoiding duplicate requests.
  useEffect(() => {
    const interval = setInterval(fetchGoals, 30000);
    return () => clearInterval(interval);
  }, [fetchGoals]);

  // Dashboard "View all goals" links directly to the existing goal collection.
  useEffect(() => {
    if (location.hash !== '#all-goals') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('all-goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  const handleCreate = () => {
    setEditingGoal(null);
    setFormOpen(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleFormSave = async (data) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await addGoalContext(data);
    }
  };

  const handleDeleteClick = (id, title) => {
    setDeleteTarget({ id, title });
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteGoalContext(deleteTarget.id);
    }
  };

  /* Statistics display */
  const statPills = [
    { label: t('goals.totalGoals'),  value: stats.total,    icon: Flag,         color: 'text-blue-600'   },
    { label: t('goals.onTrack'),     value: stats.onTrack,  icon: CheckCircle2, color: 'text-green-600' },
    { label: t('goals.warning'),      value: stats.warning,  icon: AlertTriangle,color: 'text-amber-600' },
    { label: t('goals.overBudget'),  value: stats.exceeded, icon: XCircle,      color: 'text-red-600'   },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('goals.goals')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {goals.length === 0
              ? t('goals.setFirstTarget')
              : goals.length === 1
              ? t('goals.activeGoalsCount', { count: 1 })
              : t('goals.activeGoalsCountPlural', { count: goals.length })}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleCreate}
        >
          {t('goals.newGoal')}
        </Button>
      </div>

      <GoalTrackingWidget
        onCreate={handleCreate}
        onViewAll={() => document.getElementById('all-goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        showLatestCompleted
      />

      {/* Stats strip */}
      <div id="all-goals" className="grid scroll-mt-24 grid-cols-2 xl:grid-cols-4 gap-4">
        {statPills.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <span className={`rounded-lg p-2 ${color}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Goals grid or empty state */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t('goals.noGoalsYet')}
          description={t('goals.emptyStateSubtitle')}
          variant="ghost"
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleCreate}
            >
              {t('goals.createFirstGoal')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={(id) => handleDeleteClick(id, goal.title)}
              history={[]}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleFormSave}
        editingGoal={editingGoal}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        goalTitle={deleteTarget?.title}
      />
    </div>
  );
}
