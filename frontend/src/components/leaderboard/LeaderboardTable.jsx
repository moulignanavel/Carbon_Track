import { Leaf } from 'lucide-react';
import Table from '@/components/ui/Table';

/**
 * LeaderboardTable
 * ─────────────────────────────────────────────────────────────
 * Responsive table displaying full leaderboard ranking.
 * Uses generic Table component for consistency.
 * Features:
 *   - Responsive design (horizontal scroll on mobile)
 *   - Rank, username, CO₂ saved, activity count, badges
 *   - Highlights current user's row
 *   - Sticky header
 *   - Loading skeleton support
 */

export default function LeaderboardTable({ users = [], currentUserId, isSearching = false }) {
  // Define table columns
  const columns = [
    { key: 'rank', header: 'Rank', sortable: true, align: 'left', width: '80px' },
    {
      key: 'username',
      header: 'User',
      sortable: true,
      align: 'left',
      render: (value, row) => {
        const u = row.__original;
        return (
          <div className="flex flex-col py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold ${row.isCurrentUser ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {value}
              </span>
              {u?.isAnonymous && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  🕶️ Anonymous
                </span>
              )}
            </div>
            {u?.categoryStrength && (
              <div className="mt-1">
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 cursor-help"
                  title={u.habitTip ? `Tip: ${u.habitTip}` : undefined}
                >
                  🌱 {u.categoryStrength}
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'totalEmissionsSaved',
      header: 'CO₂ Emitted',
      sortable: true,
      align: 'center',
      hidden: 'md',
      render: (value) => `${value?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || 0} kg`
    },
    { key: 'activityCount', header: 'Activities', sortable: true, align: 'center', hidden: 'sm' },
    {
      key: 'badges',
      header: 'Badges',
      sortable: false,
      align: 'right',
      render: (value) => {
        if (!value || value.length === 0) return <span className="text-slate-400 dark:text-slate-600">—</span>;
        return (
          <div className="flex flex-wrap justify-end gap-1">
            {value.map((b) => (
              <span
                key={b}
                className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30"
              >
                {b}
              </span>
            ))}
          </div>
        );
      }
    },
  ];

  // Map users to row data with custom rendering
  const rowData = users.map((user, index) => ({
    id: user.userId,
    rank: user.rank,
    username: user.username,
    totalEmissionsSaved: user.totalEmissionsSaved,
    activityCount: user.activityCount,
    badges: user.badges || [],
    userId: user.userId,
    isCurrentUser: user.userId === currentUserId,
    isTopThree: user.rank <= 3,
    isAlternate: index % 2 === 1,
    __original: user,
  }));

  return (
    <>
      <Table
        columns={columns}
        data={rowData}
        isLoading={isSearching}
        emptyTitle="No users found"
        emptyDescription="Check your filters or search term"
        zebra={true}
        stickyHeader={true}
        className="rounded-xl shadow-card dark:shadow-lg"
      />

      {/* Mobile CO₂ Legend */}
      <div className="md:hidden bg-slate-50 dark:bg-slate-800/50 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-xl px-4 py-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Leaf className="w-4 h-4" /> CO₂ Emitted (kg) shown in table
        </p>
      </div>
    </>
  );
}
