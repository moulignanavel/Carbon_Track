import { Users, Leaf, Flame, Trophy, TrendingUp } from 'lucide-react';

export default function LeaderboardHeroStats({ 
  totalMembers = 0, 
  totalCO2Saved = 0, 
  activitiesToday = 0, 
  activeChallenges = 0 
}) {
  const stats = [
    {
      id: 'members',
      title: 'Total Community Members',
      value: Number(totalMembers).toLocaleString(),
      unit: 'members',
      icon: Users,
      trend: 'Registered members',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/40'
    },
    {
      id: 'co2',
      title: 'Total CO₂ Saved',
      value: Math.round(Number(totalCO2Saved)).toLocaleString(),
      unit: 'kg CO₂e',
      icon: Leaf,
      trend: 'Database total emissions',
      accentColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      borderColor: 'border-green-200/60 dark:border-green-800/40'
    },
    {
      id: 'activities',
      title: 'Activities Logged Today',
      value: Number(activitiesToday).toLocaleString(),
      unit: 'actions',
      icon: Flame,
      trend: 'Logged today',
      accentColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-200/60 dark:border-amber-800/40'
    },
    {
      id: 'challenges',
      title: 'Active Challenges',
      value: Number(activeChallenges).toLocaleString(),
      unit: 'running',
      icon: Trophy,
      trend: 'Platform challenges',
      accentColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      borderColor: 'border-blue-200/60 dark:border-blue-800/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className={`
              relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 
              border ${stat.borderColor} p-5 
              shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.accentColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.unit}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
