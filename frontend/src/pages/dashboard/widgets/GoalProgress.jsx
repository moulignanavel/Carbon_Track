/**
 * GoalProgress — Monthly budget tracker with circular + bar progress
 */
import { Target, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, Badge, CircularProgress, ProgressBar } from '@/components/ui';
import { formatEmission } from '@/utils/formatters';

function GoalItem({ goal }) {
  const pct     = Math.min(100, (goal.current / goal.target) * 100);
  const isOver  = goal.current >= goal.target;
  const isWarn  = pct >= 80 && !isOver;
  const color   = isOver ? 'red' : isWarn ? 'yellow' : 'green';
  const variant = isOver ? 'red' : isWarn ? 'yellow' : 'green';
  const daysLeft = goal.endDate
    ? Math.ceil((new Date(goal.endDate) - new Date()) / 86_400_000)
    : null;

  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      {/* Circular meter */}
      <CircularProgress value={pct} size={56} strokeWidth={5} color={color}>
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
          {Math.round(pct)}%
        </span>
      </CircularProgress>

      {/* Detail */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {goal.title}
          </p>
          <Badge variant={variant} size="xs" dot>
            {isOver ? 'Over budget' : isWarn ? 'Watch out' : 'On track'}
          </Badge>
        </div>

        <ProgressBar
          value={goal.current}
          max={goal.target}
          size="sm"
          color={color}
          variant="gradient"
          className="mb-1.5"
        />

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formatEmission(goal.current)} used</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {daysLeft != null ? `${daysLeft}d left` : '—'} · {goal.period}
          </span>
        </div>
      </div>
    </div>
  );
}


export default function GoalProgress({ goals, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <Card.Header title="Goal Progress" icon={Target} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-2">
              <div className="skeleton-shimmer h-14 w-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton-shimmer h-3 w-2/3" />
                <div className="skeleton-shimmer h-2 w-full" />
                <div className="skeleton-shimmer h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const primaryGoal = goals[0];
  const remaining   = primaryGoal
    ? Math.max(0, primaryGoal.target - primaryGoal.current)
    : 0;

  if (!goals || goals.length === 0) {
    return (
      <Card>
        <Card.Header title="Goal Progress" icon={Target} />
        <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No goals yet.</p>
          <p className="text-xs mt-1">Create a goal on the Goals page to start tracking.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header
        title="Goal Progress"
        subtitle="Monthly carbon budget"
        icon={Target}
        iconColor="text-green-600"
        action={
          primaryGoal?.current <= primaryGoal?.target
            ? <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            : <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
        }
      />

      {/* Primary goal hero */}
      {primaryGoal && (
        <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-100 dark:border-green-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Remaining this month</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatEmission(remaining)}
              </p>
            </div>
            <CircularProgress
              value={(primaryGoal.current / primaryGoal.target) * 100}
              size={72}
              strokeWidth={7}
              color={primaryGoal.current >= primaryGoal.target ? 'red' : 'green'}
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {Math.round((primaryGoal.current / primaryGoal.target) * 100)}%
              </span>
            </CircularProgress>
          </div>
          <ProgressBar
            value={primaryGoal.current}
            max={primaryGoal.target}
            variant="gradient"
            color={primaryGoal.current >= primaryGoal.target ? 'red' : 'green'}
            size="md"
            showValue
            label={`${formatEmission(primaryGoal.current)} of ${formatEmission(primaryGoal.target)}`}
          />
        </div>
      )}

      {/* Sub-goals */}
      <div>
        {goals.slice(1).map((g) => <GoalItem key={g.id} goal={g} />)}
      </div>
    </Card>
  );
}
