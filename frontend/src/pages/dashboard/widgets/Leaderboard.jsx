/**
 * Leaderboard — org/global ranking preview
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { formatEmission, formatUserName } from '@/utils/formatters';

const RANK_STYLES = {
  1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-bold',
  2: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-bold',
};

function LeaderRow({ entry }) {
  const { t, i18n } = useTranslation();
  const { rank, username, monthly, badge, delta, isCurrentUser } = entry;
  const rankStyle = RANK_STYLES[rank] ?? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

  return (
    <li
      className={[
        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
        isCurrentUser
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
      ].join(' ')}
    >
      {/* Rank */}
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${rankStyle}`}>
        {badge ?? rank}
      </span>

      {/* Avatar + name */}
      <Avatar name={formatUserName(username, i18n.language)} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-green-700 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {formatUserName(username, i18n.language)}
          {isCurrentUser && (
            <Badge variant="green" size="xs" className="ml-2">{t('dashboard.you')}</Badge>
          )}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {formatEmission(monthly, 2, t)}
        </p>
      </div>

      {/* Delta */}
      {delta !== 0 && delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${delta < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {delta < 0
            ? <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            : <TrendingUp   className="h-3.5 w-3.5" aria-hidden="true" />}
          <span className="tabular-nums">{Math.abs(delta).toFixed(1)}</span>
        </div>
      )}
    </li>
  );
}

export default function Leaderboard({ entries, isLoading }) {
  const { t } = useTranslation();
  const visibleEntries = entries.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <Card.Header title={t('dashboard.leaderboard')} icon={Trophy} />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <div className="skeleton-shimmer h-7 w-7 rounded-lg shrink-0" />
              <div className="skeleton-shimmer h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-shimmer h-3 w-2/5" />
                <div className="skeleton-shimmer h-2.5 w-1/3" />
              </div>
              <div className="skeleton-shimmer h-3 w-10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header
        title={t('dashboard.leaderboard')}
        subtitle={`${t('dashboard.liveTop')} ${Math.min(visibleEntries.length, 5)} ${t('dashboard.lowestFootprintUsers')}`}
        icon={Trophy}
        iconColor="text-amber-500"
        action={
          <Link to="/community">
            <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              {t('dashboard.fullRanking')}
            </Button>
          </Link>
        }
      />

      <ul className="max-h-[36rem] space-y-1 overflow-y-auto pr-1" aria-label="Top 5 lowest-footprint users">
        {visibleEntries.map((entry) => (
          <LeaderRow key={entry.rank} entry={entry} />
        ))}
      </ul>

      {/* Your position callout */}
      {(() => {
        const you = visibleEntries.find((e) => e.isCurrentUser);
        if (!you) return null;
        return (
          <div className="mt-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 px-3 py-2.5">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              {t('dashboard.yourRankText', {
                rank: you.rank,
                amount: formatEmission(you.monthly - (visibleEntries.find((e) => e.rank === you.rank - 1)?.monthly ?? 0), 2, t)
              })}
            </p>
          </div>
        );
      })()}
    </Card>
  );
}
