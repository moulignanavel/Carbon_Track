import { Trophy, Leaf, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/ui/Badge';

/**
 * LeaderboardRow
 * ─────────────────────────────────────────────────────────────
 * Single row in the leaderboard table.
 * Displays rank, user info, CO₂ saved, activities, and badges.
 * Highlights top 3 and current user.
 */

export default function LeaderboardRow({
  user,
  isCurrentUser = false,
  isTopThree = false,
  isAlternate = false
}) {
  // Rank styling
  const getRankColor = (rank) => {
    if (rank === 1) return 'text-amber-600 dark:text-amber-400';
    if (rank === 2) return 'text-slate-600 dark:text-slate-400';
    if (rank === 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-slate-500 dark:text-slate-500';
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return 'bg-amber-50 dark:bg-amber-950/20';
    if (rank === 2) return 'bg-slate-100 dark:bg-slate-800/50';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/20';
    return '';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <tr
      onClick={() => window.dispatchEvent(new CustomEvent('open-badge-sidebar', { detail: user }))}
      className={`
        border-b border-slate-200 dark:border-slate-700 transition-colors cursor-pointer
        ${isCurrentUser
          ? 'bg-green-50 dark:bg-green-950/20 ring-2 ring-green-400 dark:ring-green-600 ring-inset'
          : isAlternate
            ? 'bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
        } hover:shadow-sm
      `}
    >
      {/* Rank */}
      <td className={`px-3 py-2 text-center font-bold ${getRankColor(user.rank)} ${getRankBgColor(user.rank)}`}>
        <div className="flex items-center justify-center gap-1.5">
          {getMedalIcon(user.rank) && <span className="text-base">{getMedalIcon(user.rank)}</span>}
          <span className="text-xs lg:text-sm">#{user.rank}</span>
        </div>
      </td>

      {/* Username */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate text-xs lg:text-sm">
              {user.username}
            </p>
            {isCurrentUser && (
              <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">You</p>
            )}
          </div>
        </div>
      </td>

      {/* CO₂ Saved (hidden on mobile) */}
      <td className="px-3 py-2 text-center hidden md:table-cell">
        <div className="flex items-center justify-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <div className="text-right">
            <p className="font-bold text-xs lg:text-sm text-slate-900 dark:text-slate-50">
              {user.totalCO2Saved.toLocaleString('en-US', {
                maximumFractionDigits: 1
              })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">kg</p>
          </div>
        </div>
      </td>

      {/* Activity Count (hidden on small mobile) */}
      <td className="px-3 py-2 text-center hidden sm:table-cell">
        <div className="flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <p className="font-semibold text-xs lg:text-sm text-slate-900 dark:text-slate-50">
            {user.activityCount}
          </p>
        </div>
      </td>

      {/* Badges (hidden on mobile) */}
      <td className="px-3 py-2 text-right hidden lg:table-cell">
        {user.badges && user.badges.length > 0 ? (
          <div className="flex items-center justify-end gap-1 flex-wrap">
            {user.badges.slice(0, 2).map((badge, idx) => (
              <span key={idx} className="inline-block text-sm" title={badge}>
                ⭐
              </span>
            ))}
            {user.badges.length > 2 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                +{user.badges.length - 2}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-600">—</p>
        )}
      </td>
    </tr>
  );
}
