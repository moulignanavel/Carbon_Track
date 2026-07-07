import { Leaf, Trophy } from 'lucide-react';
import Badge from '@/components/ui/Badge';

/**
 * LeaderboardSearchCard
 * ─────────────────────────────────────────────────────────────
 * Highlighted card for current user's leaderboard position.
 * Shows rank, CO₂ saved, activity count, and badges.
 */

export default function LeaderboardSearchCard({ user, highlight = false }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 p-4 lg:p-6
        transition-all shadow-card dark:shadow-lg
        ${highlight
          ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }
        hover:shadow-lg
      `}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Rank</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">#{user.rank}</p>
          </div>
        </div>

        {/* Username */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">U</span>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">User</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">{user.username}</p>
          </div>
        </div>

        {/* CO₂ Emitted */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">CO₂ Emitted</p>
            <p className="text-2xl font-bold text-green-600">
              {user.totalCO2Saved.toLocaleString('en-US', { 
                maximumFractionDigits: 1 
              })}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400"> kg</span>
            </p>
          </div>
        </div>

        {/* Activity Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">📊</span>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Activities</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{user.activityCount}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-2">Badges</p>
          <div className="flex flex-wrap gap-2">
            {user.badges.slice(0, 5).map((badge, idx) => (
              <Badge key={idx} variant="success" size="sm">
                ⭐ {badge}
              </Badge>
            ))}
            {user.badges.length > 5 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 font-medium">
                +{user.badges.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Background accent */}
      <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-10 blur-3xl bg-green-500" />
    </div>
  );
}
