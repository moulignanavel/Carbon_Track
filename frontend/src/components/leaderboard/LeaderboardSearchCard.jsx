import { Leaf, Trophy } from 'lucide-react';
import { formatLeaderboardName, getLeaderboardHabitTip } from '@/utils/leaderboardDisplay';

export default function LeaderboardSearchCard({ user, highlight = false }) {
  return (
    <div className={`rounded-xl border-2 p-4 shadow-card lg:p-6 ${
      highlight
        ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/30'
        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
    }`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Metric icon={<Trophy className="h-5 w-5 text-amber-600" />} label="Rank" value={`#${user.rank}`} />
        <Metric label="Community name" value={formatLeaderboardName(user.username, user.rank)} />
        <Metric label="Footprint score" value={`${user.footprintScore ?? 0}/100`} />
        <Metric icon={<Leaf className="h-5 w-5 text-green-600" />} label="Total CO₂e" value={`${Number(user.totalEmissionsSaved ?? 0).toFixed(1)} kg`} />
        <Metric label="Category strength" value={user.categoryStrength} />
      </div>
      <p className="mt-4 rounded-lg bg-white/70 p-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
        <strong>Habit tip:</strong> {getLeaderboardHabitTip(user)}
      </p>
      <div className="mt-3 flex flex-wrap gap-1" aria-label={user.badges?.length ? `Badges: ${user.badges.join(', ')}` : 'No badges yet'}>
        {user.badges?.length
          ? user.badges.slice(0, 5).map((badge) => <span key={badge} title={badge} className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">⭐ {badge}</span>)
          : <span className="text-xs text-slate-400">No badges earned yet</span>}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">{icon}{label}</p>
      <p className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">{value ?? '—'}</p>
    </div>
  );
}
