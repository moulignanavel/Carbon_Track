/**
 * Recommendations — personalised eco tips preview
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import LazyLottie from '@/components/common/LazyLottie';
import emptyAnimation from '@/assets/lottie/eco-empty.json';

function RecommendationCard({ rec, isExpanded, onToggle }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        <span className="shrink-0 text-xl mt-0.5" aria-hidden="true">{rec.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {rec.title}
            </p>
            <Badge variant={rec.tagColor} size="xs" className="shrink-0">{rec.tag}</Badge>
          </div>
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{rec.impact}</p>
        </div>
        <span className="shrink-0 text-slate-400 mt-0.5" aria-hidden="true">
          {isExpanded
            ? <ChevronUp  className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            {rec.detail}
          </p>
          <button
            type="button"
            onClick={() => navigate('/recommendations')}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:underline cursor-pointer"
          >
            {t('dashboard.learnMore')} <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Recommendations({ recommendations, isLoading, error }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  if (isLoading) {
    return (
      <Card>
        <Card.Header title="Recommendations" icon={Lightbulb} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex gap-3">
                <div className="skeleton-shimmer h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-shimmer h-3 w-2/3" />
                  <div className="skeleton-shimmer h-2.5 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header title="Recommendations" icon={Lightbulb} />
        <p role="alert" className="py-6 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header
        title={t('dashboard.recommendations')}
        subtitle={t('dashboard.personalisedForHabits')}
        icon={Lightbulb}
        iconColor="text-amber-500"
        className="mb-3"
      />
      <div className="space-y-1.5">
        {recommendations.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center text-sm text-slate-400 dark:text-slate-500">
            <LazyLottie animationData={emptyAnimation} height={80} width={80} loop={true} />
            <p className="mt-2">{t('dashboard.noRecommendations')}</p>
          </div>
        ) : recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            isExpanded={expanded === rec.id}
            onToggle={() => toggle(rec.id)}
          />
        ))}
      </div>
    </Card>
  );
}
