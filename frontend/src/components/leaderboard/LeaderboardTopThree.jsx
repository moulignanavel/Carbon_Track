import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * LeaderboardTopThree
 * ─────────────────────────────────────────────────────────────
 * Displays top 3 users in prominent highlight cards.
 * - White card bodies with subtle metallic accent borders
 * - Thin colored top bar (gold / silver / copper)
 * - High-contrast badge pills per badge type
 */

/* Per-badge high-contrast pill styles */
const BADGE_STYLES = {
  'Eco Pioneer': 'bg-[#e8f0fe] text-[#1a73e8]',
  'Goal Crusher': 'bg-[#fef7e0] text-[#b06000]',
  '7-Day Streak': 'bg-[#fce8e6] text-[#c5221f]',
  '10 kg Reduction': 'bg-[#e6f4ea] text-[#137333]',
  '25 kg Reduction': 'bg-[#e6f4ea] text-[#137333]',
  '50 kg Reduction': 'bg-[#e6f4ea] text-[#137333]',
  '100 kg Reduction': 'bg-[#e6f4ea] text-[#137333]',
  'Forest Guardian': 'bg-[#e6f4ea] text-[#137333]',
  'Eco Warrior': 'bg-[#e8f0fe] text-[#1a73e8]',
  'Earth Savior': 'bg-[#e8f0fe] text-[#1a73e8]',
  'Top Saver': 'bg-[#fef7e0] text-[#b06000]',
  'Eco Champion': 'bg-[#f3e8fd] text-[#6d28d9]',
  'Community Leader': 'bg-[#f3e8fd] text-[#6d28d9]',
  'Emission Target Master': 'bg-[#e8f0fe] text-[#1a73e8]',
};
const DEFAULT_BADGE_STYLE = 'bg-[#e6f4ea] text-[#137333]';

export default function LeaderboardTopThree({ users = [] }) {
  const navigate = useNavigate();

  const medalConfig = {
    1: {
      border: 'border-[#f59e0b]',
      shadow: 'shadow-[0_4px_20px_rgba(245,158,11,0.18)]',
      rankText: 'text-[#b45309]',
      medal: '🥇',
      accentBar: 'bg-[#f59e0b]',
    },
    2: {
      border: 'border-[#94a3b8]',
      shadow: 'shadow-[0_4px_14px_rgba(148,163,184,0.18)]',
      rankText: 'text-[#475569]',
      medal: '🥈',
      accentBar: 'bg-[#94a3b8]',
    },
    3: {
      border: 'border-[#d97706]',
      shadow: 'shadow-[0_4px_14px_rgba(217,119,6,0.15)]',
      rankText: 'text-[#92400e]',
      medal: '🥉',
      accentBar: 'bg-[#d97706]',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {users.map((user, index) => {
        const cfg = medalConfig[index + 1];
        return (
          <div
            key={user.userId}
            onClick={() => window.dispatchEvent(new CustomEvent('open-badge-sidebar', { detail: user }))}
            className={`
              relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-6
              transition-all cursor-pointer
              ${cfg.border} ${cfg.shadow}
              hover:shadow-xl hover:scale-[1.02] transform duration-200
            `}
          >
            {/* Thin metallic top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${cfg.accentBar} rounded-t-2xl`} />

            {/* Rank medal — top right */}
            <div className="absolute top-4 right-4 text-3xl leading-none">{cfg.medal}</div>

            {/* Content */}
            <div className="relative z-10 pt-1">
              {/* Username & Rank */}
              <div className="mb-4">
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-50 truncate pr-10">
                  {user.username}
                </h3>
                <p className={`text-sm font-bold tracking-wide ${cfg.rankText}`}>
                  Rank #{user.rank}
                </p>
              </div>

              {/* CO₂ Emitted */}
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">CO₂ Emitted</p>
                  <p className="text-2xl font-bold text-[#1b4332] dark:text-green-400">
                    {user.totalCO2Saved.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                    <span className="text-sm font-medium"> kg</span>
                  </p>
                </div>
              </div>

              {/* Activity Count */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {user.activityCount}
                  </span>
                  {' '}activities logged
                </p>
              </div>

              {/* Badges — high-contrast distinct pills */}
              {user.badges && user.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {user.badges.slice(0, 3).map((badge, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ${BADGE_STYLES[badge] ?? DEFAULT_BADGE_STYLE}`}
                    >
                      {badge}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 px-1 py-0.5">
                      +{user.badges.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
