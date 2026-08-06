import { Search, Filter, Calendar, Award, ArrowUpDown, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LeaderboardToolbar({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  isSearching = false,
  selectedScope = 'global',
  onScopeChange,
  selectedTimeframe = 'month',
  onTimeframeChange,
  selectedBadge = 'all',
  onBadgeChange,
  selectedSort = 'co2',
  onSortChange
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
      <form onSubmit={onSearchSubmit} className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
        {/* Instant Live Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by username, email, or badge…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full pl-9 pr-9 py-1.5 rounded-lg text-xs 
              bg-slate-50 dark:bg-slate-800 
              border border-slate-200 dark:border-slate-700 
              text-slate-900 dark:text-slate-100 
              focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
              transition-all
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Dropdown */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedScope}
              onChange={(e) => onScopeChange(e.target.value)}
              className="
                pl-8 pr-7 py-2 rounded-xl text-xs font-semibold 
                bg-slate-50 dark:bg-slate-800 
                border border-slate-200 dark:border-slate-700 
                text-slate-700 dark:text-slate-300
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                cursor-pointer appearance-none
              "
            >
              <option value="global">🌐 Global</option>
              <option value="organization">🏢 Organization</option>
              <option value="friends">👥 Friends</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedTimeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className="
                pl-8 pr-7 py-2 rounded-xl text-xs font-semibold 
                bg-slate-50 dark:bg-slate-800 
                border border-slate-200 dark:border-slate-700 
                text-slate-700 dark:text-slate-300
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                cursor-pointer appearance-none
              "
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div className="relative flex items-center">
            <Award className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedBadge}
              onChange={(e) => onBadgeChange(e.target.value)}
              className="
                pl-8 pr-7 py-2 rounded-xl text-xs font-semibold 
                bg-slate-50 dark:bg-slate-800 
                border border-slate-200 dark:border-slate-700 
                text-slate-700 dark:text-slate-300
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                cursor-pointer appearance-none
              "
            >
              <option value="all">All Badges</option>
              <option value="earth_savior">🌍 Earth Savior</option>
              <option value="community_leader">👑 Community Leader</option>
              <option value="top_saver">⚡ Top Saver</option>
              <option value="eco_warrior">🌱 Eco Warrior</option>
              <option value="goal_crusher">🏆 Goal Crusher</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="
                pl-8 pr-7 py-2 rounded-xl text-xs font-semibold 
                bg-slate-50 dark:bg-slate-800 
                border border-slate-200 dark:border-slate-700 
                text-slate-700 dark:text-slate-300
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                cursor-pointer appearance-none
              "
            >
              <option value="co2">CO₂ Emitted</option>
              <option value="activities">Activities Count</option>
              <option value="streak">Streak Days</option>
            </select>
          </div>

          {/* Actions */}
          <Button type="submit" variant="primary" disabled={isSearching} className="text-xs px-4 py-2">
            {isSearching ? 'Searching…' : 'Search'}
          </Button>

          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClearSearch}
              className="text-xs px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
