import { Users, Leaf, TrendingUp, Target } from 'lucide-react';

/**
 * MetricsCards
 * ─────────────────────────────────────────────────────────────
 * Key metrics displayed as cards.
 * Shows: Total employees, CO₂ saved, growth rate, target progress
 */

export default function MetricsCards({ data }) {
  if (!data) return null;

  const cards = [
    {
      title: 'Total Employees',
      value: data.totalEmployees,
      unit: '',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'CO₂ Saved',
      value: data.totalEmissionsCO2?.toLocaleString('en-US', { maximumFractionDigits: 1 }),
      unit: 'kg',
      icon: Leaf,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Avg. per Employee',
      value: data.metrics?.averageEmissionsPerEmployee?.toLocaleString('en-US', { maximumFractionDigits: 1 }),
      unit: 'kg',
      icon: TrendingUp,
      color: 'teal',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      textColor: 'text-teal-600 dark:text-teal-400'
    },
    {
      title: 'Target Progress',
      value: `${data.metrics?.percentageTowardsTarget?.toFixed(1)}`,
      unit: '%',
      icon: Target,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`${card.bgColor} rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.iconBg} rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
              {card.title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {card.value}
              <span className="text-lg font-medium text-slate-600 dark:text-slate-400 ml-1">
                {card.unit}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
