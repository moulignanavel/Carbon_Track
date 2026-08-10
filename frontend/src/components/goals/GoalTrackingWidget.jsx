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
const STATUS_STYLE_KEYS = {
  ON_TRACK: { labelKey: 'goals.onTrack', variant: 'green', color: 'green' },
  AT_RISK: { labelKey: 'goals.atRisk', variant: 'yellow', color: 'yellow' },
  OFF_TRACK: { labelKey: 'goals.offTrack', variant: 'red', color: 'red' },
  ACHIEVED: { labelKey: 'goals.achieved', variant: 'green', color: 'green' },
  MISSED: { labelKey: 'goals.missed', variant: 'red', color: 'red' },
};

const CAT_KEY_MAP = {
  transport:   'activitiesPage.catTransport',
  electricity: 'activitiesPage.catElectricity',
  food:        'activitiesPage.catFood',
  shopping:    'activitiesPage.catShopping',
  energy:      'activitiesPage.catEnergy',
};

function buildProjection(tracking) {
  const { start, end, today, current, target, recentDailyAverage, scopedLogs, allowedPerDay } = tracking;
  if (!start || !end) return [];

  const goalStart = new Date(start);
  const goalEnd = new Date(end);

  // Focus on relevant window around today while anchoring goal context
  let displayStart = new Date(Math.max(goalStart.getTime(), today.getTime() - 6 * DAY_MS));
  let displayEnd = new Date(Math.min(goalEnd.getTime(), today.getTime() + 8 * DAY_MS));

  if (displayEnd.getTime() - displayStart.getTime() < 5 * DAY_MS) {
    displayStart = new Date(today.getTime() - 4 * DAY_MS);
    displayEnd = new Date(today.getTime() + 6 * DAY_MS);
  }

  const emissionsByDay = new Map();
  scopedLogs.forEach((log) => {
    const date = parseGoalDate(log.logDate ?? log.date);
    if (!date) return;
    const key = goalDayKey(date);
    emissionsByDay.set(key, (emissionsByDay.get(key) ?? 0) + Math.max(0, Number(log.calculatedEmissions ?? 0) || 0));
  });

  // Calculate cumulative emissions up to window start
  let cumulativeBefore = 0;
  emissionsByDay.forEach((val, key) => {
    const date = parseGoalDate(key);
    if (date && date < displayStart) cumulativeBefore += val;
  });

  let runningActual = cumulativeBefore;
  let totalUpToToday = cumulativeBefore;

  // Pre-calculate actual total up to today
  for (let d = new Date(displayStart); d <= today; d.setDate(d.getDate() + 1)) {
    totalUpToToday += emissionsByDay.get(goalDayKey(d)) ?? 0;
  }

  const baseTodayValue = Math.max(Number(current) || 0, totalUpToToday);
  const projectionDailyRate = recentDailyAverage > 0 
    ? recentDailyAverage 
    : (allowedPerDay > 0 ? allowedPerDay : Math.max(0.5, target / 30));

  const points = [];
  for (let date = new Date(displayStart); date <= displayEnd; date.setDate(date.getDate() + 1)) {
    const copy = new Date(date);
    const dateStr = copy.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const isToday = copy.getTime() === today.getTime();
    const isPast = copy < today;

    if (isPast) {
      runningActual += emissionsByDay.get(goalDayKey(copy)) ?? 0;
      points.push({
        date: dateStr,
        actual: Number(runningActual.toFixed(2)),
        projected: null,
        target: Number(target.toFixed(2)),
      });
    } else if (isToday) {
      // Seamless connection point: both actual and projected share the exact same today value
      points.push({
        date: dateStr,
        actual: Number(baseTodayValue.toFixed(2)),
        projected: Number(baseTodayValue.toFixed(2)),
        target: Number(target.toFixed(2)),
      });
    } else {
      // Future projection forecast continuing smoothly from today's actual
      const futureDays = Math.max(1, Math.round((copy - today) / DAY_MS));
      const projectedVal = baseTodayValue + projectionDailyRate * futureDays;
      points.push({
        date: dateStr,
        actual: null,
        projected: Number(projectedVal.toFixed(2)),
        target: Number(target.toFixed(2)),
      });
    }
  }
  return points;
}

function ProjectionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="mb-2 font-bold text-slate-800 dark:text-slate-100">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {Number(item.value).toFixed(2)} kg CO₂e
            </span>
          </div>
        ))}
      </div>
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

  const statusStyle = STATUS_STYLE_KEYS[tracking.status] || STATUS_STYLE_KEYS.ON_TRACK;
  const statusLabel = t(statusStyle.labelKey);

  const titleKey = (selectedGoal.title || '').toLowerCase();
  const displayTitle = CAT_KEY_MAP[titleKey] ? t(CAT_KEY_MAP[titleKey]) : selectedGoal.title;

  return (
    <Card className={className}>
      <Card.Header
        title={t('goals.goalTracking')}
        subtitle={selectedGoal.description || displayTitle}
        icon={Target}
        action={<Badge variant={statusStyle.variant} dot>{statusLabel}</Badge>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{displayTitle}</h3>
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
            label={`${Math.min(999, tracking.progress).toFixed(1)}% ${t('goals.consumed')}`}
          />

          <div className="grid grid-cols-3 gap-2">
            {[
              [t('goals.current'), formatEmission(tracking.current)],
              [t('goals.allowed'), formatEmission(tracking.target)],
              [t('goals.remaining'), formatEmission(tracking.remaining)],
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
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('goals.dailyReductionRequired')}</p>
            </div>
            <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
              {formatEmission(tracking.dailyReductionRequired)} {t('goals.perDay')}
            </p>
            <p className="mt-1 text-xs text-green-700/80 dark:text-green-300/80">
              {tracking.daysRemaining === 0
                ? t('goals.goalPeriodEnded')
                : tracking.dailyReductionRequired > 0
                  ? t('goals.reduceDailyAverage', { average: formatEmission(tracking.recentDailyAverage), allowance: formatEmission(tracking.allowedPerDay) })
                  : t('goals.withinAllowance', { allowance: formatEmission(tracking.allowedPerDay) })}
            </p>
          </div>
          {onViewAll ? (
            <button
              type="button"
              className="text-sm font-semibold text-green-600 hover:underline cursor-pointer"
              onClick={onViewAll}
            >
              {t('goals.viewAllGoals')}
            </button>
          ) : (
            <Link className="inline-block text-sm font-semibold text-green-600 hover:underline" to="/goals#all-goals">
              {t('goals.viewAllGoals')}
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
              {t('goals.notEnoughDataProjection')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={chartData} accessibilityLayer margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  width={52}
                  tickFormatter={(val) => `${val} kg`}
                  domain={[0, (dataMax) => Math.max(Math.ceil(dataMax * 1.25), Math.ceil((tracking.target || 0) * 1.15), 5)]}
                />
                <Tooltip content={<ProjectionTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <ReferenceLine
                  y={tracking.target}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  label={{
                    value: `Target: ${tracking.target} kg`,
                    position: 'insideTopRight',
                    fill: '#d97706',
                    fontSize: 11,
                    fontWeight: 600,
                    dy: -8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name={t('goals.actualFootprint')}
                  stroke="#10b981"
                  strokeWidth={3}
                  connectNulls={false}
                  dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  name={t('goals.projectedEstimate')}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  connectNulls={false}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 5.5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
