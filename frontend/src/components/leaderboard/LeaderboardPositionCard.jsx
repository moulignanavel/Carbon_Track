import { useNavigate } from 'react-router-dom';
import { Leaf, Flame, Target, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LeaderboardPositionCard({ user, allUsers = [], onLogActivity }) {
  const navigate = useNavigate();

  if (!user) return null;

  const userRank = user.rank || 1;
  const targetRank = Math.max(1, userRank - 1);

  // Find user ranked directly above
  const userAbove = allUsers.find(u => u.rank === targetRank);

  let distanceToNextRankKg = 0;
  let progressPct = 100;

  if (userAbove && userAbove.userId !== user.userId) {
    const userCO2 = user.totalCO2Saved || 0;
    const targetCO2 = userAbove.totalCO2Saved || 0;

    // In lower-emissions-is-better leaderboard, user needs to reduce emissions down to targetCO2
    if (userCO2 > targetCO2) {
      distanceToNextRankKg = Math.round((userCO2 - targetCO2) * 10) / 10;
      progressPct = userCO2 > 0 ? Math.max(10, Math.min(99, Math.round((targetCO2 / userCO2) * 100))) : 80;
    } else {
      distanceToNextRankKg = Math.round((targetCO2 - userCO2) * 10) / 10;
      progressPct = 95;
    }
  }

  const handleLogClick = () => {
    if (onLogActivity) {
      onLogActivity();
    } else {
      navigate('/activities');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-50 p-3 shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
      {/* Soft background glow */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-200/40 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left Section: User Info & Rank */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center font-extrabold text-lg text-emerald-800 dark:text-emerald-200 shadow-inner">
              {user.username ? user.username.charAt(0).toUpperCase() : 'Y'}
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-md">
              #{userRank}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                Your Position
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Global Rank #{userRank}</span>
            </div>
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-50">
              {user.username}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <Leaf className="w-3 h-3" />
                {user.totalCO2Saved?.toLocaleString() || 0} kg CO₂ Emitted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Flame className="w-3 h-3 fill-amber-500" />
                {user.streak || (userRank % 5) + 3}d Streak
              </span>
            </p>
          </div>
        </div>

        {/* Center Section: Motivational Progress Bar Card */}
        <div className="flex-1 max-w-md bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-bold">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {userRank === 1 ? '🌟 You hold Rank #1!' : `Target: Reach Rank #${targetRank}`}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-extrabold">{progressPct}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
            {userRank === 1 ? (
              <span>🎉 Amazing work! You are currently the <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">#1 Eco Champion</strong> in the community!</span>
            ) : (
              <span>💡 Reduce your footprint by <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{distanceToNextRankKg} kg CO₂e</strong> to climb to <strong className="text-slate-900 dark:text-slate-100 font-extrabold">Rank #{targetRank}</strong>!</span>
            )}
          </p>
        </div>

        {/* Right Section: Log Activity CTA */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleLogClick}
            className="
              px-3 py-1.5 rounded-lg font-bold text-xs text-white 
              bg-emerald-600 hover:bg-emerald-700
              shadow-sm shadow-emerald-600/20 transition-all transform hover:scale-105
              flex items-center gap-1.5 whitespace-nowrap border-0
            "
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Activity</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
