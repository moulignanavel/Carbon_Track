import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getCommunityLeaderboard, searchLeaderboard } from '@/api/leaderboardApi';
import { useAuth } from '@/context/AuthContext';
import LeaderboardHeroStats from '@/components/leaderboard/LeaderboardHeroStats.jsx';
import LeaderboardToolbar from '@/components/leaderboard/LeaderboardToolbar.jsx';
import LeaderboardTopThree from '@/components/leaderboard/LeaderboardTopThree.jsx';
import LeaderboardPositionCard from '@/components/leaderboard/LeaderboardPositionCard.jsx';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable.jsx';
import CommunityInsights from '@/components/leaderboard/CommunityInsights.jsx';
import WeeklyChallengeWidget from '@/components/leaderboard/WeeklyChallengeWidget.jsx';
import RecentAchievementsFeed from '@/components/leaderboard/RecentAchievementsFeed.jsx';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import BadgeSidebar from '@/components/badges/BadgeSidebar';

export default function CommunityLeaderboardPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Filter States
  const [selectedScope, setSelectedScope] = useState('global');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [selectedSort, setSelectedSort] = useState('co2');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarUser, setSidebarUser] = useState(null);

  const loadLeaderboardData = async () => {
    try {
      setError(null);
      const data = await getCommunityLeaderboard();
      setLeaderboardData(data);
      window.dispatchEvent(new CustomEvent('leaderboard-viewed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenSidebar = (e) => {
      setSidebarUser(e.detail);
      setSidebarOpen(true);
    };
    window.addEventListener('open-badge-sidebar', handleOpenSidebar);
    window.addEventListener('activity-logged', loadLeaderboardData);

    return () => {
      window.removeEventListener('open-badge-sidebar', handleOpenSidebar);
      window.removeEventListener('activity-logged', loadLeaderboardData);
    };
  }, []);

  // Load initial leaderboard data dynamically from API
  useEffect(() => {
    setIsLoading(true);
    loadLeaderboardData();
  }, []);

  // Handle explicit API search submit
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      loadLeaderboardData();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const data = await searchLeaderboard(searchQuery);
      setLeaderboardData(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    loadLeaderboardData();
  };

  const rawUsers = leaderboardData?.all || [];

  // Instant Live Filtering & Sorting
  const filteredUsers = useMemo(() => {
    let list = [...rawUsers];

    // 1. Text Search Filter (Username, Email, Rank, Badge)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(u => {
        const uName = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const badge = (u.badge || '').toLowerCase();
        const rank = String(u.rank || '');
        return uName.includes(q) || email.includes(q) || badge.includes(q) || rank === q;
      });
    }

    // 2. Badge Filter
    if (selectedBadge !== 'all') {
      const bQuery = selectedBadge.replace('_', ' ').toLowerCase();
      list = list.filter(u => {
        const uBadge = (u.badge || '').toLowerCase();
        const uBadges = (u.badges || []).map(b => b.toLowerCase());
        return uBadge.includes(bQuery) || uBadges.some(b => b.includes(bQuery));
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (selectedSort === 'activities') {
        return (b.activityCount || 0) - (a.activityCount || 0);
      }
      if (selectedSort === 'streak') {
        return (b.streak || 0) - (a.streak || 0);
      }
      // Default: CO2 saved / emitted ascending
      return (a.totalCO2Saved || 0) - (b.totalCO2Saved || 0);
    });

    return list;
  }, [rawUsers, searchQuery, selectedBadge, selectedSort]);

  if (isLoading) {
    return <Spinner fullPage label="Loading Community Leaderboard…" />;
  }

  const topThree = leaderboardData?.topThree || rawUsers.slice(0, 3);
  const activeUserCard = leaderboardData?.currentUser || (rawUsers.length > 0 ? rawUsers[0] : null);

  // Dynamic API metrics
  const totalMembers = leaderboardData?.totalCommunityMembers || rawUsers.length;
  const totalCO2Saved = leaderboardData?.totalCO2Saved || 0;
  const activitiesToday = leaderboardData?.activitiesLoggedToday || 0;
  const activeChallenges = leaderboardData?.activeChallenges || 0;
  const recentAchievements = leaderboardData?.recentAchievements || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Community Leaderboard
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Track eco-impact, compete with peers, and climb the sustainability rankings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="error" title="Error">{error}</Alert>}

      {/* 1. Hero KPI Summary Cards (Dynamic Backend API Metrics) */}
      <LeaderboardHeroStats 
        totalMembers={totalMembers}
        totalCO2Saved={totalCO2Saved}
        activitiesToday={activitiesToday}
        activeChallenges={activeChallenges}
      />

      {/* 2. Instant Search & Toolbar Filters */}
      <LeaderboardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedBadge={selectedBadge}
        onBadgeChange={setSelectedBadge}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* 3. Top Performers Podium Cards */}
      {!searchQuery.trim() && topThree.length > 0 && (
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
            <span>🏆</span> Top Performers Podium
          </h2>
          <LeaderboardTopThree users={topThree} />
        </div>
      )}

      {/* 4. Your Position Card (Dynamic Progress & Distance with + Log Activity) */}
      {activeUserCard && (
        <div>
          <LeaderboardPositionCard 
            user={activeUserCard}
            allUsers={rawUsers}
            onLogActivity={() => navigate('/activities')} 
          />
        </div>
      )}

      {/* 5. Main Content Grid: Leaderboard Table & Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Table (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              {searchQuery.trim() ? `🔍 Search Results (${filteredUsers.length})` : '📊 Community Rankings'}
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredUsers.length} of {rawUsers.length} Members
            </span>
          </div>

          <LeaderboardTable
            users={filteredUsers}
            currentUserId={currentUser?.userId}
            isSearching={isSearching}
          />
        </div>

        {/* Sidebar Widgets (Span 1) */}
        <div className="space-y-6">
          <WeeklyChallengeWidget />
          <CommunityInsights totalCO2Saved={totalCO2Saved} />
          <RecentAchievementsFeed achievements={recentAchievements} />
        </div>
      </div>

      {/* Badge Detail Sidebar */}
      <BadgeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={sidebarUser}
      />
    </div>
  );
}
