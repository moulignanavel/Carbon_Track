import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { getCommunityLeaderboard, searchLeaderboard } from '@/api/leaderboardApi';
import { useAuth } from '@/context/AuthContext';
import LeaderboardTopThree from '@/components/leaderboard/LeaderboardTopThree';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LeaderboardSearchCard from '@/components/leaderboard/LeaderboardSearchCard';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * CommunityLeaderboardPage
 * ─────────────────────────────────────────────────────────────
 * Main leaderboard page featuring:
 *   - Top 3 highlighted cards
 *   - Full ranking table (up to 50)
 *   - Search and filtering
 *   - Current user's rank highlight
 *   - Responsive design
 */

export default function CommunityLeaderboardPage() {
  const { user: currentUser } = useAuth();
  
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial leaderboard
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCommunityLeaderboard();
        setLeaderboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leaderboard');
        console.error('Leaderboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setHasSearched(false);
      const data = await getCommunityLeaderboard();
      setLeaderboardData(data);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const data = await searchLeaderboard(searchQuery);
      setLeaderboardData(data);
      setHasSearched(true);
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
    setHasSearched(false);
    getCommunityLeaderboard().then(data => {
      setLeaderboardData(data);
    });
  };

  if (isLoading) {
    return <Spinner fullPage label="Loading leaderboard…" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">
            Community Leaderboard
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Join the movement to reduce carbon emissions. See who's saving the most CO₂.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert variant="danger" title="Error" message={error} />
        </div>
      )}

      {/* Search Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by username or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="primary" disabled={isSearching}>
              {isSearching ? 'Searching…' : 'Search'}
            </Button>
            {hasSearched && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Top 3 Highlight */}
      {!hasSearched && leaderboardData?.topThree && (
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            🏆 Top Performers
          </h2>
          <LeaderboardTopThree users={leaderboardData.topThree} />
        </div>
      )}

      {/* Current User Card (if not in top 3) */}
      {leaderboardData?.currentUser && 
       !leaderboardData?.topThree?.some(u => u.userId === leaderboardData.currentUser.userId) && (
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
            📍 Your Position
          </h2>
          <LeaderboardSearchCard user={leaderboardData.currentUser} highlight={true} />
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
          {hasSearched ? '🔍 Search Results' : '📊 Top 50 Users'}
        </h2>
        <LeaderboardTable 
          users={leaderboardData?.all || []} 
          currentUserId={currentUser?.userId}
          isSearching={isSearching}
        />
      </div>

      {/* Empty State */}
      {leaderboardData?.all?.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No users found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
