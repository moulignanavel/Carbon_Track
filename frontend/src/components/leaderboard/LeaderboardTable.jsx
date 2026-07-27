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
    { key: 'username', header: 'User', sortable: true, align: 'left' },
    {
      key: 'totalEmissionsSaved',
      header: 'CO₂ Emitted',
      sortable: true,
      align: 'center',
      hidden: 'md',
      render: (value) => `${value?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || 0} kg`
    },
    { key: 'activityCount', header: 'Activities', sortable: true, align: 'center', hidden: 'sm' },
    { key: 'badge', header: 'Badges', sortable: false, align: 'right', hidden: 'lg' },
  ];

  // Map users to row data with custom rendering
  const rowData = users.map((user, index) => ({
    id: user.userId,
    rank: user.rank,
    username: user.username,
    totalEmissionsSaved: user.totalEmissionsSaved,
    activityCount: user.activityCount,
    badge: user.badge,
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
