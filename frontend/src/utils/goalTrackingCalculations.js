const DAY_MS = 86_400_000;
export const TERMINAL_GOAL_STATUSES = new Set(['ACHIEVED', 'MISSED']);

export function parseGoalDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) return new Date(value[0], value[1] - 1, value[2]);
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function goalDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function emissionsForGoal(logs, goal) {
  const category = String(goal.category ?? 'all').toLowerCase();
  return logs.filter((log) => {
    if (category === 'all') return true;
    const logCategory = String(log.category ?? '').toLowerCase();
    if (category.includes('energy') || category.includes('electric')) {
      return logCategory === 'energy' || logCategory === 'electricity';
    }
    return logCategory === category;
  });
}

export function calculateGoalTracking(goal, logs = [], now = new Date()) {
  if (!goal) return null;
  const start = parseGoalDate(goal.startDate);
  const end = parseGoalDate(goal.endDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = Math.max(0, Number(goal.target ?? 0) || 0);
  const current = Math.max(0, Number(goal.current ?? 0) || 0);
  const remaining = Math.max(0, target - current);
  const progress = target > 0 ? Math.max(0, (current / target) * 100) : 0;
  const totalDays = start && end ? Math.max(1, Math.floor((end - start) / DAY_MS) + 1) : 1;
  const elapsedDays = start ? Math.min(totalDays, Math.max(1, Math.floor((today - start) / DAY_MS) + 1)) : 1;
  const daysRemaining = end ? Math.max(0, Math.ceil((end - today) / DAY_MS)) : 0;
  const allowedPerDay = daysRemaining > 0 ? remaining / daysRemaining : 0;
  const scopedLogs = emissionsForGoal(logs, goal);
  const recentStart = new Date(today);
  recentStart.setDate(today.getDate() - 6);
  const recentTotal = scopedLogs.reduce((sum, log) => {
    const date = parseGoalDate(log.logDate ?? log.date);
    return date && date >= recentStart && date <= today
      ? sum + Math.max(0, Number(log.calculatedEmissions ?? 0) || 0)
      : sum;
  }, 0);
  const recentDailyAverage = recentTotal / 7;
  const dailyReductionRequired = daysRemaining > 0
    ? Math.max(0, recentDailyAverage - allowedPerDay)
    : 0;
  const projectedBaseline = recentDailyAverage * totalDays;
  const targetReductionPercentage = projectedBaseline > 0
    ? Math.max(0, ((projectedBaseline - target) / projectedBaseline) * 100)
    : 0;
  const backendStatus = String(goal.status ?? '').toUpperCase();
  let status;
  if (TERMINAL_GOAL_STATUSES.has(backendStatus)) {
    status = backendStatus;
  } else if (end && today > end) {
    status = current <= target ? 'ACHIEVED' : 'MISSED';
  } else {
    const expectedByNow = target * (elapsedDays / totalDays);
    status = current <= expectedByNow
      ? 'ON_TRACK'
      : current <= expectedByNow * 1.15
        ? 'AT_RISK'
        : 'OFF_TRACK';
  }
  return {
    start, end, today, target, current, remaining, progress,
    daysRemaining, allowedPerDay, recentDailyAverage,
    dailyReductionRequired, targetReductionPercentage, status,
    scopedLogs,
  };
}
