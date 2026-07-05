/**
 * RecentActivities — scrollable list of latest logged items
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatEmission, formatDate } from '@/utils/formatters';
import { CATEGORY_COLORS } from '@/constants/theme';

const BADGE_VARIANT = {
  transport: 'green',
  energy:    'yellow',
  food:      'teal',
  shopping:  'purple',
  waste:     'red',
  other:     'slate',
};

function ActivityItem({ activity }) {
  const { category, activityType, emissions, amount, unit, logDate, icon } = activity;
  const isHighEmission = emissions > 5;

  return (
    <li className="group flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/70 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-lg transition-colors duration-100">
      {/* Icon badge */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base shadow-sm"
        style={{ background: CATEGORY_COLORS[category] + '22' }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {activityType}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {amount} {unit} · {formatDate(logDate)}
        </p>
      </div>

      {/* Emission badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={`text-xs font-bold tabular-nums ${
            isHighEmission
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-700 dark:text-green-400'
          }`}
        >
          {formatEmission(emissions)}
        </span>
        <Badge variant={BADGE_VARIANT[category] ?? 'slate'} size="xs">
          {category}
        </Badge>
      </div>
    </li>
  );
}

export default function RecentActivities({ activities, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <Card.Header title="Recent Activities" icon={Clock} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="skeleton-shimmer h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-shimmer h-3 w-3/4" />
                <div className="skeleton-shimmer h-2.5 w-1/2" />
              </div>
              <div className="skeleton-shimmer h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header
        title="Recent Activities"
        subtitle={`${activities.length} entries`}
        icon={Clock}
        action={
          <Link to="/activities">
            <Button
              variant="ghost"
              size="xs"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              View all
            </Button>
          </Link>
        }
      />

      {activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-600">
          No activities yet — start logging!
        </div>
      ) : (
        <ul className="space-y-0">
          {activities.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}
        </ul>
      )}

      {/* Total strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Showing last {activities.length}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Total: {formatEmission(activities.reduce((s, a) => s + a.emissions, 0))}
        </span>
      </div>
    </Card>
  );
}
