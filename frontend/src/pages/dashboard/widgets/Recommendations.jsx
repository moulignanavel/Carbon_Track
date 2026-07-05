/**
 * Recommendations — personalised eco tips preview
 */
import { useState } from 'react';
import { ArrowRight, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

function RecommendationCard({ rec, isExpanded, onToggle }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
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
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-3">
            {rec.detail}
          </p>
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:underline cursor-pointer"
          >
            Learn more <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Recommendations({ recommendations, isLoading }) {
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

  return (
    <Card>
      <Card.Header
        title="Recommendations"
        subtitle="Personalised for your habits"
        icon={Lightbulb}
        iconColor="text-amber-500"
      />
      <div className="space-y-2.5">
        {recommendations.map((rec) => (
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
