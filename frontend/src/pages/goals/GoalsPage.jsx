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

import { useState, useMemo } from 'react';
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
import { MOCK_GOAL_HISTORY } from '@/data/goalsMock';
import { COLORS }        from '@/constants/theme';

import {
  Button, Card, Badge, Modal,
  Input, Select, EmptyState,
  Alert,
} from '@/components/ui';
import GoalTimelineChart from '@/components/charts/GoalTimelineChart';

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
  if (pct >= 100) return { key: 'exceeded', label: 'Over budget', variant: 'red',    icon: XCircle,      barColor: 'red'    };
  if (pct >= 85)  return { key: 'warning',  label: 'Watch out',   variant: 'yellow', icon: AlertTriangle, barColor: 'yellow' };
  return             { key: 'on-track',  label: 'On track',    variant: 'green',  icon: CheckCircle2, barColor: 'green'  };
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

/* ══════════════════════════════════════════════════════════════
   Goal Card — displays one goal with progress, controls, timeline
   ══════════════════════════════════════════════════════════════ */
function GoalCard({ goal, onEdit, onDelete, history }) {
  const status       = getGoalStatus(goal);
  const pct          = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  const remaining    = Math.max(0, goal.target - goal.current);
  const daysLeftVal  = daysLeft(goal.endDate);
  const catMeta      = goal.category !== 'all' ? CATEGORY_META[goal.category] : null;
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = status.icon;

  return (
    <Card hover className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {goal.title}
            </h3>
            <Badge variant={status.variant} size="xs" dot>
              {status.label}
            </Badge>
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
            {catMeta.emoji}  {catMeta.label}
          </Badge>
        )}
        {goal.category === 'all' && (
          <Badge variant="green" size="sm">🌍  All Categories</Badge>
        )}
        <Badge variant="slate" size="sm">
          {capitalize(goal.period)}
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
          label={`${formatEmission(goal.current)} of ${formatEmission(goal.target)}`}
        />
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-slate-400">Remaining</p>
            <p className={`font-bold ${
              remaining > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatEmission(remaining)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Days Left</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {daysLeftVal != null ? `${daysLeftVal}d` : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Period</p>
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
            <span>Progress Timeline</span>
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
          Edit
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

/* ══════════════════════════════════════════════════════════════
   Goal Form Modal — create / edit with RHF + Zod
   ══════════════════════════════════════════════════════════════ */
function GoalFormModal({ isOpen, onClose, onSave, editingGoal }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: editingGoal ?? {
      title:       '',
      description: '',
      category:    'all',
      period:      'monthly',
      target:      '',
      startDate:   today,
      endDate:     today,
    },
  });

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
  const { goals, stats, addGoal: addGoalContext, updateGoal, deleteGoal: deleteGoalContext } = useGoals();

  const [formOpen,      setFormOpen]      = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [editingGoal,   setEditingGoal]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

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
      updateGoal(editingGoal.id, data);
      toast.success('Goal updated');
    } else {
      addGoalContext(data);
    }
  };

  const handleDeleteClick = (id, title) => {
    setDeleteTarget({ id, title });
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteGoalContext(deleteTarget.id);
      toast.success('Goal deleted');
    }
  };

  /* Statistics display */
  const statPills = [
    { label: 'Total Goals',     value: stats.total,    icon: Flag,         color: 'text-blue-600'   },
    { label: 'On Track',        value: stats.onTrack,  icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Warning',         value: stats.warning,  icon: AlertTriangle,color: 'text-amber-600' },
    { label: 'Over Budget',     value: stats.exceeded, icon: XCircle,      color: 'text-red-600'   },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Goals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {goals.length === 0
              ? 'Set your first carbon reduction target'
              : `${goals.length} active goal${goals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleCreate}
        >
          New Goal
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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
          title="No goals yet"
          description="Set a carbon reduction target to start tracking your progress toward sustainability."
          variant="ghost"
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleCreate}
            >
              Create Your First Goal
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
              history={MOCK_GOAL_HISTORY[goal.id] ?? []}
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
