/**
 * ChallengesPage.jsx  —  Eco Challenge System
 * ─────────────────────────────────────────────────────────────
 * Sections:
 *   1. Hero banner  — XP total, level ring, missions completed
 *   2. Filter tabs  — All | Active | Completed | by category
 *   3. Challenge cards grid  — progress bar, XP badge, Join button
 *   4. My Active Missions sidebar
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, Zap, Leaf, ShoppingBag, Car, Flame,
  Calendar, Star, CheckCircle2, Lock, Target,
  TrendingDown, BarChart2, Clock,
} from 'lucide-react';

import { useChallenges }  from '@/context/ChallengeContext';
import { useAuth }        from '@/context/AuthContext';
import { Card, Badge, Button, Tabs, ProgressBar, Spinner, EmptyState } from '@/components/ui';
import { formatEmission, capitalize } from '@/utils/formatters';

/* ── Icon map (matches Challenge.iconKey from backend seed) ──── */
const ICON_MAP = {
  car:          Car,
  salad:        Leaf,
  zap:          Zap,
  calendar:     Calendar,
  'shopping-bag': ShoppingBag,
  leaf:         Leaf,
  star:         Star,
  trophy:       Trophy,
};

function ChallengeIcon({ iconKey, className = 'h-6 w-6' }) {
  const Icon = ICON_MAP[iconKey] ?? Target;
  return <Icon className={className} />;
}

/* ── Category colours ────────────────────────────────────────── */
const CAT_STYLE = {
  transport:   { badge: 'blue',   ring: 'from-blue-500 to-blue-400'   },
  electricity: { badge: 'yellow', ring: 'from-amber-500 to-yellow-400' },
  food:        { badge: 'teal',   ring: 'from-green-500 to-teal-400'  },
  shopping:    { badge: 'purple', ring: 'from-purple-500 to-violet-400' },
  energy:      { badge: 'red',    ring: 'from-red-500 to-orange-400'  },
  all:         { badge: 'green',  ring: 'from-emerald-500 to-green-400' },
};

const STATUS_FILTER_TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'active',    label: 'Active'    },
  { id: 'completed', label: 'Completed' },
  { id: 'available', label: 'Available' },
];

/* ── XP level thresholds ─────────────────────────────────────── */
function getLevel(xp) {
  if (xp >= 1500) return { level: 5, title: 'Eco Champion',  next: Infinity };
  if (xp >= 900)  return { level: 4, title: 'Green Expert',  next: 1500 };
  if (xp >= 500)  return { level: 3, title: 'Eco Warrior',   next: 900  };
  if (xp >= 200)  return { level: 2, title: 'Green Starter', next: 500  };
  return              { level: 1, title: 'Eco Novice',    next: 200  };
}

/* ── Progress label helper ───────────────────────────────────── */
function progressLabel(c) {
  const metric = c.metricType;
  const prog   = c.progressValue ?? 0;
  const target = c.targetValue ?? 1;

  if (metric === 'LOG_DAYS')    return `${Math.floor(prog)} / ${target} days`;
  if (metric === 'LOG_ENTRIES') return `${Math.floor(prog)} / ${target} entries`;
  // STAY_UNDER / REDUCE_EMISSIONS
  return `${prog.toFixed(2)} / ${target} kg CO₂e`;
}

/* ── Confetti burst ──────────────────────────────────────────── */
function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  });
}

/* ══════════════════════════════════════════════════════════════
   Challenge Card
   ══════════════════════════════════════════════════════════════ */
function ChallengeCard({ challenge, onJoin, previousStatus }) {
  const { status, progressPct = 0, xpReward, category, iconKey } = challenge;
  const catStyle  = CAT_STYLE[category] ?? CAT_STYLE.all;
  const isJoined  = status !== 'NOT_JOINED';
  const isDone    = status === 'COMPLETED';
  const isActive  = status === 'IN_PROGRESS';
  const [joining, setJoining] = useState(false);

  // Fire confetti when newly completed
  useEffect(() => {
    if (isDone && previousStatus && previousStatus !== 'COMPLETED') {
      fireConfetti();
    }
  }, [isDone, previousStatus]);

  const handleJoin = async () => {
    setJoining(true);
    await onJoin(challenge.id);
    setJoining(false);
  };

  return (
    <div className={`card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
      isDone ? 'ring-2 ring-emerald-400 dark:ring-emerald-500' : ''
    }`}>
      {/* Completion ribbon */}
      {isDone && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            <CheckCircle2 className="h-3 w-3" /> DONE
          </span>
        </div>
      )}

      {/* Gradient top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${catStyle.ring} rounded-t-xl`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catStyle.ring} text-white shadow-sm`}>
            <ChallengeIcon iconKey={iconKey} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Badge variant={catStyle.badge} size="xs">{capitalize(category)}</Badge>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded px-1.5 py-0.5">
                +{xpReward} XP
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {/* Progress section */}
        {isJoined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
              <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {progressLabel(challenge)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isDone
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, progressPct ?? 0)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">
                {isActive ? 'In progress' : 'Complete!'}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {(progressPct ?? 0).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Period badge + Join button */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" />
            {challenge.period === 'weekly' ? 'Weekly reset' : 'One-time'}
          </span>

          {isDone ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : isActive ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Target className="h-3.5 w-3.5" />
              Active
            </span>
          ) : (
            <Button
              variant="primary"
              size="xs"
              isLoading={joining}
              onClick={handleJoin}
              id={`join-challenge-${challenge.id}`}
            >
              Accept Mission
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   XP Level Ring
   ══════════════════════════════════════════════════════════════ */
function XpRing({ xp, level, levelTitle, nextXp }) {
  const pct = nextXp === Infinity ? 100 : Math.min(100, (xp / nextXp) * 100);
  const R = 38, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  return (
    <div className="relative flex items-center justify-center h-24 w-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={R} fill="none" stroke="currentColor"
          strokeWidth="7" className="text-white/20" />
        <circle cx="48" cy="48" r={R} fill="none"
          stroke="url(#xpGrad)" strokeWidth="7"
          strokeDasharray={`${dash} ${C}`}
          strokeLinecap="round" />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-white leading-none">
          {level}
        </p>
        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wide mt-0.5">
          Level
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function ChallengesPage() {
  const { challenges, isLoading, join } = useChallenges();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [prevStatuses, setPrevStatuses] = useState({});

  // Track previous statuses for confetti trigger
  useEffect(() => {
    const map = {};
    challenges.forEach(c => { map[c.id] = c.status; });
    setPrevStatuses(prev => {
      // Only keep previous if we already had it (don't overwrite first load)
      const merged = { ...map };
      Object.keys(prev).forEach(k => { if (prev[k]) merged[k] = prev[k]; });
      return merged;
    });
  }, []); // only on mount

  const totalXp = useMemo(
    () => challenges.filter(c => c.status === 'COMPLETED').reduce((s, c) => s + (c.xpReward ?? 0), 0),
    [challenges],
  );
  const { level, title: levelTitle, next: nextXp } = getLevel(totalXp);
  const completedCount = challenges.filter(c => c.status === 'COMPLETED').length;
  const activeCount    = challenges.filter(c => c.status === 'IN_PROGRESS').length;

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      const matchStatus =
        filter === 'all'       ? true :
        filter === 'active'    ? c.status === 'IN_PROGRESS' :
        filter === 'completed' ? c.status === 'COMPLETED' :
        filter === 'available' ? c.status === 'NOT_JOINED' : true;
      const matchCat = catFilter === 'all' || c.category === catFilter;
      return matchStatus && matchCat;
    });
  }, [challenges, filter, catFilter]);

  const categories = useMemo(() => {
    const cats = [...new Set(challenges.map(c => c.category))].filter(c => c !== 'all');
    return ['all', ...cats];
  }, [challenges]);

  const catTabs = categories.map(c => ({ id: c, label: c === 'all' ? 'All Categories' : capitalize(c) }));

  const handleJoin = useCallback(async (id) => {
    const prevStatus = challenges.find(c => c.id === id)?.status;
    await join(id);
    // Check if newly completed after join
    const updated = challenges.find(c => c.id === id);
    if (updated?.status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
      fireConfetti();
    }
  }, [join, challenges]);

  return (
    <div className="space-y-6 fade-in">

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 p-6 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 right-20 h-28 w-28 rounded-full bg-white/10 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {/* XP Ring */}
          <div className="flex items-center gap-4">
            <XpRing xp={totalXp} level={level} levelTitle={levelTitle} nextXp={nextXp} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                Your Rank
              </p>
              <h2 className="text-2xl font-black text-white leading-tight">{levelTitle}</h2>
              <p className="text-sm font-semibold text-emerald-100 mt-0.5">
                {totalXp} XP total
                {nextXp !== Infinity && (
                  <span className="text-white font-normal"> · {nextXp - totalXp} to next level</span>
                )}
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 sm:ml-auto">
            {[
              { label: 'Completed', value: completedCount, icon: CheckCircle2 },
              { label: 'Active',    value: activeCount,    icon: Target       },
              { label: 'Total XP',  value: totalXp,        icon: Trophy       },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center rounded-xl bg-white/20 border border-white/25 px-4 py-3 backdrop-blur-sm min-w-[76px] shadow-sm">
                <Icon className="h-4 w-4 text-emerald-200 mb-1" />
                <span className="text-xl font-black text-white leading-none">{value}</span>
                <span className="text-[11px] font-semibold text-emerald-100 mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP progress bar to next level */}
        {nextXp !== Infinity && (
          <div className="relative mt-5">
            <div className="flex justify-between text-xs font-semibold text-emerald-100 mb-1.5">
              <span>Level {level}</span>
              <span>Level {level + 1} — {nextXp} XP</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-emerald-950/40 border border-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-white transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, (totalXp / nextXp) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs
          tabs={STATUS_FILTER_TABS}
          variant="pills"
          activeTab={filter}
          defaultTab="all"
          onChange={setFilter}
        />
        <div className="sm:ml-auto">
          <Tabs
            tabs={catTabs}
            variant="pills"
            activeTab={catFilter}
            defaultTab="all"
            onChange={setCatFilter}
          />
        </div>
      </div>

      {/* ── Challenge Cards ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges found"
          description={
            filter === 'completed'
              ? "You haven't completed any challenges yet. Join one to get started!"
              : filter === 'active'
              ? "No active challenges. Accept a mission below!"
              : "No challenges available. Check back soon!"
          }
          action={
            filter !== 'all' ? (
              <Button variant="primary" size="sm" onClick={() => setFilter('all')}>
                View All Missions
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onJoin={handleJoin}
              previousStatus={prevStatuses[c.id]}
            />
          ))}
        </div>
      )}

      {/* ── Tip strip ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
        <div className="flex items-start gap-3">
          <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              How Challenges Work
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
              Accept a mission and your progress is tracked automatically from your activity logs.
              Weekly challenges reset every Monday. Earn XP to level up your sustainability rank!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
