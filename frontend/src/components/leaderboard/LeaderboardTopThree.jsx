import { Medal, Leaf } from 'lucide-react';

/**
 * LeaderboardTopThree
 * ─────────────────────────────────────────────────────────────
 * Displays top 3 users in prominent highlight cards.
 * Features:
 *   - Rank badges (gold, silver, bronze)
 *   - CO₂ saved with icon
 *   - Activity count
 *   - Badge display
 *   - Responsive grid (1 col mobile → 3 col desktop)
 */

export default function LeaderboardTopThree({ users = [] }) {
  const medalColors = {
    1: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300', text: 'text-amber-700 dark:text-amber-300', medal: '🥇' },
    2: { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', medal: '🥈' },
    3: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300', text: 'text-orange-700 dark:text-orange-300', medal: '🥉' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {users.map((user, index) => {
        const medal = medalColors[index + 1];
        return (
          <div
            key={user.userId}
            onClick={() => window.dispatchEvent(new CustomEvent('open-badge-sidebar', { detail: user }))}
            className={`
              relative overflow-hidden rounded-2xl border-2 p-6 transition-all cursor-pointer
              ${medal.bg} ${medal.border}
              hover:shadow-lg hover:scale-105 transform duration-200
              dark:shadow-lg shadow-md
            `}
          >
            {/* Rank badge */}
            <div className="absolute top-3 right-3 text-3xl">{medal.medal}</div>

            {/* Content */}
            <div className="relative z-10">
              {/* Username & Rank */}
              <div className="mb-4">
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">
                  {user.username}
                </h3>
                <p className={`text-sm font-semibold ${medal.text}`}>
                  Rank #{user.rank}
                </p>
              </div>

              {/* CO₂ Emitted */}
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">CO₂ Emitted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user.totalCO2Saved.toLocaleString('en-US', { 
                      maximumFractionDigits: 1 
                    })}
                    <span className="text-sm font-medium"> kg</span>
                  </p>
                </div>
              </div>

              {/* Activity Count */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {user.activityCount}
                  </span>
                  {' '}activities logged
                </p>
              </div>

              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.badges.slice(0, 3).map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                    >
                      ⭐ {badge}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                      +{user.badges.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Background gradient accent */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-3xl bg-green-500" />
          </div>
        );
      })}
    </div>
  );
}
