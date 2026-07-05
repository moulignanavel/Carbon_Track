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
    iconBg:   'bg-amber-100 dark:bg-amber-900/30',
    iconColor:'text-amber-600 dark:text-amber-400',
  },
  {
    key:      'weekly',
    title:    'This Week',
    icon:     CalendarDays,
    iconBg:   'bg-teal-100 dark:bg-teal-900/30',
    iconColor:'text-teal-600 dark:text-teal-400',
  },
  {
    key:      'monthly',
    title:    'This Month',
    icon:     BarChart2,
    iconBg:   'bg-purple-100 dark:bg-purple-900/30',
    iconColor:'text-purple-600 dark:text-purple-400',
  },
  {
    key:      'avgPerDay',
    title:    'Daily Average',
    icon:     TrendingDown,
    iconBg:   'bg-green-100 dark:bg-green-900/30',
    iconColor:'text-green-600 dark:text-green-400',
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
