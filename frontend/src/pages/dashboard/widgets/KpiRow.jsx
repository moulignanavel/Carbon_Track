/**
 * KpiRow — Today / Weekly / Monthly / Avg stat cards
 */
import { Sun, CalendarDays, BarChart2, TrendingDown } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { CardSkeleton } from '@/components/skeletons';
import { formatEmission } from '@/utils/formatters';

const CARDS = [
  {
    key:      'today',
    title:    "Today's Carbon",
    icon:     Sun,
    iconBg:   'bg-[#e8f0e6] dark:bg-green-900/30',
    iconColor:'text-[#2d6a4f] dark:text-green-400',
  },
  {
    key:      'weekly',
    title:    'This Week',
    icon:     CalendarDays,
    iconBg:   'bg-[#e8f0e6] dark:bg-green-900/30',
    iconColor:'text-[#2d6a4f] dark:text-green-400',
  },
  {
    key:      'monthly',
    title:    'This Month',
    icon:     BarChart2,
    iconBg:   'bg-[#e8f0e6] dark:bg-green-900/30',
    iconColor:'text-[#2d6a4f] dark:text-green-400',
  },
  {
    key:      'avgPerDay',
    title:    'Daily Average',
    icon:     TrendingDown,
    iconBg:   'bg-[#e8f0e6] dark:bg-green-900/30',
    iconColor:'text-[#2d6a4f] dark:text-green-400',
  },
];

export default function KpiRow({ kpi, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((c) => <CardSkeleton key={c.key} lines={2} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map(({ key, title, icon, iconBg, iconColor }) => {
        const stat = kpi[key];
        return (
          <StatCard
            key={key}
            title={title}
            value={formatEmission(stat.value)}
            icon={icon}
            iconBg={iconBg}
            iconColor={iconColor}
            trend={stat.trend}
            trendValue={`${stat.delta > 0 ? '+' : ''}${stat.delta.toFixed(2)} kg`}
            trendLabel={stat.deltaLabel}
          />
        );
      })}
    </div>
  );
}
