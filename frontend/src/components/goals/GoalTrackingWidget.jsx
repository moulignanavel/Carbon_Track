import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CalendarDays, Plus, Target, TrendingDown } from 'lucide-react';
import { useActivity } from '@/context/ActivityContext';
import { useGoals } from '@/context/GoalContext';
import { Badge, Button, Card, ProgressBar } from '@/components/ui';
import { formatDate, formatEmission } from '@/utils/formatters';
import {
  calculateGoalTracking, goalDayKey, parseGoalDate, TERMINAL_GOAL_STATUSES,
} from '@/utils/goalTrackingCalculations';

const DAY_MS = 86_400_000;
const STATUS_STYLE = {
  ON_TRACK: { label: 'On track', variant: 'green', color: 'green' },
  AT_RISK: { label: 'At risk', variant: 'yellow', color: 'yellow' },
  OFF_TRACK: { label: 'Off track', variant: 'red', color: 'red' },
  ACHIEVED: { label: 'Achieved', variant: 'green', color: 'green' },
  MISSED: { label: 'Missed', variant: 'red', color: 'red' },
};

function buildProjection(tracking) {
  const { start, end, today, current, target, recentDailyAverage, scopedLogs } = tracking;
  if (!start || !end) return [];
  const displayStart = new Date(Math.max(start.getTime(), today.getTime() - 13 * DAY_MS));
  const displayEnd = new Date(Math.min(end.getTime(), today.getTime() + 14 * DAY_MS));
  const emissionsByDay = new Map();
  scopedLogs.forEach((log) => {
    const date = parseGoalDate(log.logDate ?? log.date);
    if (!date || date < start || date > end) return;
    const key = goalDayKey(date);
    emissionsByDay.set(key, (emissionsByDay.get(key) ?? 0) + Math.max(0, Number(log.calculatedEmissions ?? 0) || 0));
  });
  let cumulativeBeforeWindow = 0;
  emissionsByDay.forEach((value, key) => {
    const date = parseGoalDate(key);
    if (date < displayStart) cumulativeBeforeWindow += value;
  });
  let cumulative = cumulativeBeforeWindow;
  const points = [];
  for (let date = new Date(displayStart); date <= displayEnd; date.setDate(date.getDate() + 1)) {
    const copy = new Date(date);
    if (copy <= today) cumulative += emissionsByDay.get(goalDayKey(copy)) ?? 0;
    const futureDays = Math.max(0, Math.round((copy - today) / DAY_MS));
    points.push({
      date: copy.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      actual: copy <= today ? Number(cumulative.toFixed(2)) : null,
      projected: copy >= today ? Number((current + recentDailyAverage * futureDays).toFixed(2)) : null,
      target,
    });
  }
  return points;
}

function ProjectionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {Number(item.value).toFixed(2)} kg CO₂e
        </p>
      ))}
    </div>
  );
}

export default function GoalTrackingWidget({
  onCreate,
  onViewAll,
  showLatestCompleted = false,
  className = '',
}) {
  const { t } = useTranslation();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { logs, isLoading: logsLoading } = useActivity();
  const today = useMemo(() => new Date(), []);
  const activeGoal = goals.find((goal) => {
    const status = String(goal.status ?? '').toUpperCase();
    const end = parseGoalDate(goal.endDate);
    return !TERMINAL_GOAL_STATUSES.has(status) && (!end || end >= new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  });
  const selectedGoal = activeGoal ?? (showLatestCompleted ? goals[0] : null);
  const tracking = useMemo(
    () => calculateGoalTracking(selectedGoal, logs, today),
    [selectedGoal, logs, today],
  );
  const chartData = useMemo(() => tracking ? buildProjection(tracking) : [], [tracking]);

  if (goalsLoading || logsLoading) {
    return <Card className={className}><div className="skeleton-shimmer h-80 rounded-xl" /></Card>;
  }

  if (!selectedGoal || !tracking) {
    return (
      <Card className={className}>
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <Target className="mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('goals.noActiveGoal')}</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">{t('goals.noActiveGoalSubtitle')}</p>
        </div>
      </Card>
    );
  }

  const statusStyle = STATUS_STYLE[tracking.status];
  return (
    <Card className={className}>
      <Card.Header
        title={t('goals.goalTracking')}
        subtitle={selectedGoal.description || selectedGoal.title}
        icon={Target}
        action={<Badge variant={statusStyle.variant} dot>{statusStyle.label}</Badge>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedGoal.title}</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(selectedGoal.startDate)} – {formatDate(selectedGoal.endDate)}</span>
              <span>{t('goals.estimatedReductionTarget', { percent: tracking.targetReductionPercentage.toFixed(1) })}</span>
            </div>
          </div>

          <ProgressBar
            value={tracking.current}
            max={tracking.target || 1}
            color={statusStyle.color}
            size="md"
            showValue
            label={`${Math.min(999, tracking.progress).toFixed(1)}% consumed`}
          />

          <div className="grid grid-cols-3 gap-2">
            {[
              ['Current', formatEmission(tracking.current)],
              ['Allowed', formatEmission(tracking.target)],
              ['Remaining', formatEmission(tracking.remaining)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Daily reduction required</p>
            </div>
            <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
              {formatEmission(tracking.dailyReductionRequired)} per day
            </p>
            <p className="mt-1 text-xs text-green-700/80 dark:text-green-300/80">
              {tracking.daysRemaining === 0
                ? 'This goal period has ended; no future daily allowance is calculated.'
                : tracking.dailyReductionRequired > 0
                  ? `Reduce your recent ${formatEmission(tracking.recentDailyAverage)} daily average by this amount, and remain below ${formatEmission(tracking.allowedPerDay)} per day.`
                  : `Your recent daily average is within the remaining allowance of ${formatEmission(tracking.allowedPerDay)} per day.`}
            </p>
          </div>
          {onViewAll ? (
            <button
              type="button"
              className="text-sm font-semibold text-green-600 hover:underline"
              onClick={onViewAll}
            >
              View all goals
            </button>
          ) : (
            <Link className="inline-block text-sm font-semibold text-green-600 hover:underline" to="/goals#all-goals">
              View all goals
            </Link>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('goals.footprintProjection')}</p>
            <span className="text-xs text-slate-400">{t('goals.projectedValuesAreEstimates')}</span>
          </div>
          {chartData.length < 2 ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-400 dark:bg-slate-800/40">
              Not enough date information to create a projection.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={chartData} accessibilityLayer margin={{ top: 12, right: 12, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip content={<ProjectionTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={tracking.target} stroke="#f59e0b" strokeDasharray="5 4" label="Goal target" />
                <Line dataKey="actual" name="Actual footprint" stroke="#16a34a" strokeWidth={2.5} connectNulls={false} dot={false} />
                <Line dataKey="projected" name="Projected estimate" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4" connectNulls={false} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
