/**
 * ActivitiesPage.jsx — full Activity Logging module
 *
 * Sections:
 *  1. Page header + summary KPIs
 *  2. Category mini-bar chart
 *  3. Log Activity Form (inline, below header on mobile / side panel on desktop)
 *     - Category tabs (Transport / Electricity / Food / Shopping / Energy)
 *     - Activity type dropdown (filtered per category)
 *     - Quantity input + unit dropdown
 *     - Date picker
 *     - Notes textarea
 *     - Real-time CO₂ preview panel
 *  4. Filters (search + category + date range)
 *  5. Activity table with sort, badge, delete
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Trash2, Leaf,
  ChevronDown, X, SlidersHorizontal,
  CalendarDays, FileText, Zap,
} from 'lucide-react';

import { useActivity } from '@/context/ActivityContext';
import { useAuth }     from '@/context/AuthContext';
import { activityLogSchema } from '@/utils/validators';
import { formatEmission, formatDate, capitalize } from '@/utils/formatters';
import {
  ACTIVITY_CATEGORIES, CATEGORY_META,
  CATEGORY_TAB_ORDER, TYPE_MAP, estimateEmissions,
} from '@/constants/activities';
import {
  Button, Card, Badge, Table, Input,
  Select, EmptyState, StatCard,
} from '@/components/ui';
import EmissionsBarChart from '@/components/charts/EmissionsBarChart';

/* ═══════════════════════════════════════════════════════════════
   Constants & helpers
   ═══════════════════════════════════════════════════════════════ */

const BADGE_VARIANT = {
  transport:   'green',
  electricity: 'yellow',
  food:        'teal',
  shopping:    'purple',
  energy:      'red',
};

const today = new Date().toISOString().split('T')[0];

/** Build category tabs in fixed order */
const CAT_TABS = CATEGORY_TAB_ORDER.map((key) => {
  const cat  = ACTIVITY_CATEGORIES.find((c) => c.value === key);
  const meta = CATEGORY_META[key] ?? {};
  return { key, label: cat?.label ?? key, emoji: cat?.emoji ?? '•', meta };
});

/** Table column definitions */
const COLUMNS = [
  {
    key: 'logDate', header: 'Date', sortable: true,
    render: (v) => (
      <span className="text-slate-600 dark:text-slate-400 tabular-nums text-xs">
        {formatDate(v)}
      </span>
    ),
  },
  {
    key: 'category', header: 'Category', sortable: true,
    render: (v) => (
      <Badge variant={BADGE_VARIANT[v] ?? 'slate'} size="sm" dot>
        {CATEGORY_META[v]?.emoji ?? ''} {CATEGORY_META[v]?.label ?? capitalize(v ?? '—')}
      </Badge>
    ),
  },
  {
    key: 'activityLabel', header: 'Activity', sortable: true,
    render: (v, row) => (
      <span className="font-medium text-slate-800 dark:text-slate-200">
        {v ?? row.activityType?.replace(/_/g, ' ')}
      </span>
    ),
  },
  {
    key: 'amount', header: 'Amount', sortable: true, align: 'right',
    render: (v, row) => (
      <span className="tabular-nums text-slate-600 dark:text-slate-400">
        {v} {row.unit}
      </span>
    ),
  },
  {
    key: 'calculatedEmissions', header: 'CO₂e', sortable: true, align: 'right',
    render: (v) => {
      const color =
        v > 50  ? 'text-red-600 dark:text-red-400' :
        v > 10  ? 'text-amber-600 dark:text-amber-400' :
                  'text-green-700 dark:text-green-400';
      return (
        <span className={`font-semibold tabular-nums ${color}`}>
          {formatEmission(v)}
        </span>
      );
    },
  },
  {
    key: 'notes', header: 'Notes',
    render: (v) => (
      <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[120px] block">
        {v || '—'}
      </span>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════
   CO₂ Preview Panel
   ═══════════════════════════════════════════════════════════════ */
function Co2Preview({ activityType, amount, category }) {
  const type   = TYPE_MAP[activityType];
  const kg     = estimateEmissions(activityType, Number(amount));
  const hasVal = activityType && amount > 0;

  const meta     = CATEGORY_META[category] ?? {};
  const equiv    = kg > 0 ? [
    { label: 'km driven (petrol)',    val: (kg / 0.18).toFixed(0)  },
    { label: 'smartphone charges',    val: Math.round(kg / 0.008)  },
    { label: 'tree-days to absorb',   val: Math.round(kg / 0.027)  },
  ] : [];

  const level =
    !hasVal          ? null :
    kg === 0         ? 'zero' :
    kg < 2           ? 'low'  :
    kg < 10          ? 'mid'  :
    kg < 50          ? 'high' : 'very-high';

  const levelCfg = {
    zero:      { label: 'Net zero',    color: 'text-green-600',  bar: 'bg-green-500',  bg: 'bg-green-50  dark:bg-green-900/20'  },
    low:       { label: 'Low impact',  color: 'text-green-600',  bar: 'bg-green-500',  bg: 'bg-green-50  dark:bg-green-900/20'  },
    mid:       { label: 'Moderate',    color: 'text-amber-600',  bar: 'bg-amber-500',  bg: 'bg-amber-50  dark:bg-amber-900/20'  },
    high:      { label: 'High impact', color: 'text-orange-600', bar: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    'very-high':{ label: 'Very high',  color: 'text-red-600',    bar: 'bg-red-500',    bg: 'bg-red-50    dark:bg-red-900/20'    },
  };
  const cfg = level ? levelCfg[level] : null;
  const barPct = Math.min(100, (kg / 100) * 100);

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${
      cfg ? `${cfg.bg} border-slate-200 dark:border-slate-700` :
      'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" aria-hidden="true" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          Real-time CO₂ Preview
        </p>
      </div>

      {!hasVal ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3">
          Enter an amount to see the estimated CO₂ impact
        </p>
      ) : (
        <>
          {/* Big number */}
          <div className="flex items-end gap-2 mb-3">
            <span className={`text-3xl font-bold tabular-nums leading-none ${cfg?.color ?? 'text-slate-700 dark:text-slate-200'}`}>
              {formatEmission(kg)}
            </span>
            {cfg && (
              <Badge
                variant={
                  level === 'low' || level === 'zero' ? 'green' :
                  level === 'mid'                     ? 'yellow' :
                  level === 'high'                    ? 'orange' : 'red'
                }
                size="xs"
              >
                {cfg.label}
              </Badge>
            )}
          </div>

          {/* Bar */}
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg?.bar ?? 'bg-slate-400'}`}
              style={{ width: `${barPct}%` }}
              role="progressbar"
              aria-valuenow={Math.round(barPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Factor info */}
          {type && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              {type.factor} kg CO₂e per {type.unit} · {type.description}
            </p>
          )}

          {/* Equivalences */}
          {equiv.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Equivalent to</p>
              {equiv.map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Log Activity Form
   ═══════════════════════════════════════════════════════════════ */
function LogActivityForm({ onSaved, onCancel, defaultCategory }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultCategory ?? CAT_TABS[0].key);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(activityLogSchema),
    defaultValues: {
      category:    defaultCategory ?? CAT_TABS[0].key,
      activityType:'',
      amount:      '',
      unit:        '',
      logDate:     today,
      notes:       '',
    },
  });

  const category     = watch('category');
  const activityType = watch('activityType');
  const amount       = watch('amount');
  const unit         = watch('unit');

  /* switch tab → update category field, reset type/unit */
  const handleTabSwitch = useCallback((key) => {
    setActiveTab(key);
    setValue('category',    key,  { shouldValidate: false });
    setValue('activityType','',   { shouldValidate: false });
    setValue('unit',        '',   { shouldValidate: false });
  }, [setValue]);

  /* auto-set unit when type changes */
  useEffect(() => {
    const typeObj = TYPE_MAP[activityType];
    if (typeObj?.unit) setValue('unit', typeObj.unit, { shouldValidate: false });
  }, [activityType, setValue]);

  const catDef     = ACTIVITY_CATEGORIES.find((c) => c.value === activeTab);
  const typeOptions = (catDef?.types ?? []).map((t) => ({ value: t.value, label: `${t.icon}  ${t.label}` }));
  const typeObj    = TYPE_MAP[activityType];
  const unitOptions = (typeObj?.unitOptions ?? (unit ? [unit] : [])).map((u) => ({ value: u, label: u }));
  const meta       = CATEGORY_META[activeTab] ?? {};

  const onSubmit = async (data) => {
    const typeObj2 = TYPE_MAP[data.activityType];
    const emissions = estimateEmissions(data.activityType, Number(data.amount));
    await onSaved({
      ...data,
      amount:              Number(data.amount),
      activityLabel:       typeObj2?.label ?? data.activityType,
      calculatedEmissions: emissions,
      userId:              user?.userId,
    });
    reset({ category: activeTab, activityType: '', amount: '', unit: '', logDate: today, notes: '' });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Category tabs */}
      <div
        className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide"
        role="tablist"
        aria-label="Activity category"
      >
        {CAT_TABS.map(({ key, label, emoji, meta: m }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => handleTabSwitch(key)}
            className={[
              'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2',
              'text-sm font-medium border transition-all duration-150 cursor-pointer shrink-0',
              activeTab === key
                ? `${m.bgLight} ${m.border} ${m.iconCls}`
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
            ].join(' ')}
          >
            <span aria-hidden="true">{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate id="activity-form">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: form fields ────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Activity type */}
            <Select
              label="Activity Type"
              placeholder="Select an activity…"
              required
              options={typeOptions}
              error={errors.activityType?.message}
              {...register('activityType')}
            />

            {/* Amount + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                type="number"
                min="0.001"
                step="any"
                placeholder="0"
                required
                error={errors.amount?.message}
                hint={typeObj ? `per ${typeObj.unit}` : undefined}
                {...register('amount', { valueAsNumber: false })}
              />
              <div>
                <label className="form-label">
                  Unit <span className="text-red-500">*</span>
                </label>
                {unitOptions.length > 1 ? (
                  <Select
                    options={unitOptions}
                    error={errors.unit?.message}
                    {...register('unit')}
                  />
                ) : (
                  <Input
                    type="text"
                    placeholder="unit"
                    readOnly={!!typeObj?.unit}
                    error={errors.unit?.message}
                    {...register('unit')}
                  />
                )}
              </div>
            </div>

            {/* Date */}
            <Input
              label="Date"
              type="date"
              required
              max={today}
              leftIcon={<CalendarDays className="h-4 w-4" />}
              error={errors.logDate?.message}
              {...register('logDate')}
            />

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                Notes
                <span className="ml-auto text-xs font-normal text-slate-400">optional</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. drive to office, weekly shop…"
                maxLength={300}
                className="form-input resize-none"
                aria-label="Notes"
                {...register('notes')}
              />
              {errors.notes && (
                <p role="alert" className="form-error">{errors.notes.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                form="activity-form"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Plus className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? 'Saving…' : 'Save Activity'}
              </Button>
              {onCancel && (
                <Button type="button" variant="ghost" size="md" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* ── Right: CO₂ preview ───────────────────────── */}
          <div className="hidden lg:block">
            <p className="form-label mb-2">Impact Preview</p>
            <Co2Preview
              activityType={activityType}
              amount={amount}
              category={activeTab}
            />
          </div>
        </div>

        {/* Mobile CO₂ preview (below form) */}
        <div className="lg:hidden mt-4">
          <Co2Preview activityType={activityType} amount={amount} category={activeTab} />
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Delete confirmation row action
   ═══════════════════════════════════════════════════════════════ */
function DeleteCell({ log, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline cursor-pointer"
          onClick={() => onDelete(log.id)}
        >
          Confirm
        </button>
        <button
          className="text-xs text-slate-400 hover:underline cursor-pointer"
          onClick={() => setConfirm(false)}
        >
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors cursor-pointer"
      aria-label="Delete activity"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function ActivitiesPage() {
  const { logs, isLoading, fetchLogs, addLog, deleteLog, totalEmissions } = useActivity();
  const [formOpen,   setFormOpen]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [filtersOpen,setFiltersOpen]= useState(false);
  const [defaultCat, setDefaultCat] = useState(null);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /* ── open form pre-set to a category ──────────────────────── */
  const openWithCategory = (cat) => {
    setDefaultCat(cat);
    setFormOpen(true);
    setTimeout(() => document.getElementById('activity-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  /* ── filtered logs ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let r = logs;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((l) =>
        l.activityType?.toLowerCase().includes(q) ||
        (l.activityLabel ?? '').toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q) ||
        (l.notes ?? '').toLowerCase().includes(q)
      );
    }
    if (catFilter) r = r.filter((l) => l.category === catFilter);
    if (dateFrom)  r = r.filter((l) => l.logDate >= dateFrom);
    if (dateTo)    r = r.filter((l) => l.logDate <= dateTo);
    return r;
  }, [logs, search, catFilter, dateFrom, dateTo]);

  /* ── bar chart data ────────────────────────────────────────── */
  const barData = useMemo(() => {
    const map = {};
    logs.forEach((l) => {
      const cat = l.category ?? 'other';
      map[cat] = (map[cat] ?? 0) + (l.calculatedEmissions ?? 0);
    });
    return Object.entries(map)
      .map(([cat, v]) => ({
        name: CATEGORY_META[cat]?.label ?? capitalize(cat),
        value: +v.toFixed(2),
        category: cat,
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  /* ── KPI values ────────────────────────────────────────────── */
  const todayStr       = today;
  const todayEmissions = logs
    .filter((l) => l.logDate === todayStr)
    .reduce((s, l) => s + (l.calculatedEmissions ?? 0), 0);
  const thisMonthPfx   = today.slice(0, 7);
  const monthEmissions = logs
    .filter((l) => l.logDate?.startsWith(thisMonthPfx))
    .reduce((s, l) => s + (l.calculatedEmissions ?? 0), 0);

  /* ── save handler ──────────────────────────────────────────── */
  const handleSave = async (data) => {
    await addLog(data);
    toast.success(
      <div>
        <p className="font-semibold">Activity logged! 🌱</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {formatEmission(data.calculatedEmissions)} CO₂e added
        </p>
      </div>
    );
    setFormOpen(false);
  };

  /* ── columns with delete action ────────────────────────────── */
  const tableColumns = useMemo(() => [
    ...COLUMNS,
    {
      key: '_delete', header: '', align: 'right',
      render: (_, row) => <DeleteCell log={row} onDelete={deleteLog} />,
    },
  ], [deleteLog]);

  const activeFilterCount = [catFilter, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="space-y-6 fade-in">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Activity Log</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {logs.length} activities · {formatEmission(totalEmissions)} total
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => { setDefaultCat(null); setFormOpen((o) => !o); }}
        >
          {formOpen ? 'Close Form' : 'Log Activity'}
        </Button>
      </div>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today"        value={formatEmission(todayEmissions)}  icon={Zap}
          iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" />
        <StatCard title="This Month"   value={formatEmission(monthEmissions)}  icon={CalendarDays}
          iconBg="bg-teal-100 dark:bg-teal-900/30"   iconColor="text-teal-600 dark:text-teal-400" />
        <StatCard title="All-time"     value={formatEmission(totalEmissions)}  icon={Leaf}
          iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" />
        <StatCard title="Entries"      value={logs.length}                     icon={FileText}
          iconBg="bg-slate-100 dark:bg-slate-800"    iconColor="text-slate-600 dark:text-slate-400" />
      </div>

      {/* ── Quick-category shortcut strip ────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {CAT_TABS.map(({ key, label, emoji, meta }) => (
          <button
            key={key}
            type="button"
            onClick={() => openWithCategory(key)}
            className={[
              'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 cursor-pointer',
              'transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 group',
              meta.bgLight, meta.border,
            ].join(' ')}
            aria-label={`Log ${label}`}
          >
            <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
            <span className={`text-xs font-semibold leading-none ${meta.iconCls}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Log Activity form panel ───────────────────────────── */}
      {formOpen && (
        <Card className="border-green-200 dark:border-green-900/50">
          <Card.Header
            title="Log New Activity"
            subtitle="Fill in the details below"
            icon={Plus}
            action={
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close form"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          />
          <LogActivityForm
            onSaved={handleSave}
            onCancel={() => setFormOpen(false)}
            defaultCategory={defaultCat}
          />
        </Card>
      )}

      {/* ── Category bar chart ───────────────────────────────── */}
      {barData.length > 0 && (
        <Card>
          <Card.Header title="Emissions by Category" subtitle="All-time (kg CO₂e)" />
          <EmissionsBarChart data={barData} colorByCategory height={180} />
        </Card>
      )}

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by activity, category, or notes…"
              className="form-input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search activities"
            />
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={[
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
              filtersOpen || activeFilterCount > 0
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
            ].join(' ')}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 slide-up">
            {/* Category */}
            <div>
              <label className="form-label flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" /> Category
              </label>
              <Select
                options={ACTIVITY_CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji}  ${c.label}` }))}
                placeholder="All categories"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
              />
            </div>
            {/* Date from */}
            <Input
              label="From date"
              type="date"
              max={dateTo || today}
              leftIcon={<CalendarDays className="h-4 w-4" />}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            {/* Date to */}
            <Input
              label="To date"
              type="date"
              min={dateFrom || undefined}
              max={today}
              leftIcon={<CalendarDays className="h-4 w-4" />}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {/* Clear */}
            {activeFilterCount > 0 && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  onClick={() => { setCatFilter(''); setDateFrom(''); setDateTo(''); }}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {activeFilterCount > 0 && !filtersOpen && (
          <div className="flex flex-wrap gap-2">
            {catFilter && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                {CATEGORY_META[catFilter]?.emoji} {CATEGORY_META[catFilter]?.label ?? catFilter}
                <button type="button" onClick={() => setCatFilter('')} className="cursor-pointer hover:opacity-70">
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                From {formatDate(dateFrom)}
                <button type="button" onClick={() => setDateFrom('')} className="cursor-pointer hover:opacity-70">
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            )}
            {dateTo && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                To {formatDate(dateTo)}
                <button type="button" onClick={() => setDateTo('')} className="cursor-pointer hover:opacity-70">
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <Table
        columns={tableColumns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="No activities found"
        emptyDescription={
          activeFilterCount > 0 || search
            ? 'Try adjusting your filters or search term.'
            : 'Click "Log Activity" to record your first entry.'
        }
        zebra
        stickyHeader
      />
    </div>
  );
}
