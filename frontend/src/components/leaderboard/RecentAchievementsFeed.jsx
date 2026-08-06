import { Award, TrendingUp, CheckCircle, UserPlus, Flame, Activity } from 'lucide-react';

export default function RecentAchievementsFeed({ achievements = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'badge':
        return { comp: Award, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'rank':
        return { comp: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'goal':
        return { comp: CheckCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'activity':
        return { comp: Activity, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' };
      case 'join':
      default:
        return { comp: UserPlus, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
    }
  };

  const feed = Array.isArray(achievements) ? achievements : [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          Recent Community Achievements
        </h3>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          Live Feed
        </span>
      </div>

      {feed.length === 0 ? (
        <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          <Activity className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            No recent community activities yet.
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Log your daily eco activities to trigger live community achievements!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {feed.map((item, idx) => {
            const { comp: IconComp, color } = getIcon(item.iconType);
            return (
              <div
                key={item.id || idx}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className={`p-1.5 rounded-lg border ${color}`}>
                  <IconComp className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.user} <span className="font-normal text-slate-500">{item.action}</span>
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    {item.detail}
                  </p>
                </div>

                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {item.timeAgo || 'recent'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
