import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Lock, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useActivity } from '@/context/ActivityContext';
import { useGoals } from '@/context/GoalContext';
import { useCelebration } from '@/context/CelebrationContext';

/* ─── Badge data ─────────────────────────────────────────────────────────── */
export const BADGES = [
  {
    name: 'Eco Pioneer',
    emoji: '🌿',
    iconUrl: '/badges/eco-pioneer.png',
    description: 'Log your first environmental activity.',
    outerRing: 'from-[#a78bfa] via-[#818cf8] to-[#312e81]',
    outerRingLocked: 'from-[#c4b5fd]/40 via-[#a78bfa]/25 to-[#4c1d95]/30',
    innerBg: 'from-[#4c1d95] to-[#2e1065]',
    innerBgLocked: 'from-[#ede9fe]/60 to-[#ddd6fe]/40',
    innerBgLockedDark: 'from-[#2e1065]/40 to-[#1e1b4b]/50',
    glowDark: '0 0 28px rgba(139,92,246,0.75)',
    glowLight: '0 0 20px rgba(139,92,246,0.35)',
    pillLight: 'bg-violet-100 border-violet-300 text-violet-700',
    pillDark: 'bg-violet-900/30 border-violet-500/40 text-violet-300',
    lockedTextLight: 'text-violet-400',
    lockedTextDark: 'text-violet-700/50',
  },
  {
    name: 'Goal Crusher',
    emoji: '🎯',
    iconUrl: '/badges/goal-crusher.png',
    description: 'Complete a carbon goal under your emission budget.',
    outerRing: 'from-[#fb923c] via-[#ea580c] to-[#7c2d12]',
    outerRingLocked: 'from-[#fed7aa]/40 via-[#fb923c]/25 to-[#7c2d12]/30',
    innerBg: 'from-[#9a3412] to-[#7c2d12]',
    innerBgLocked: 'from-[#fff7ed]/60 to-[#ffedd5]/40',
    innerBgLockedDark: 'from-[#7c2d12]/40 to-[#431407]/50',
    glowDark: '0 0 28px rgba(234,88,12,0.7)',
    glowLight: '0 0 20px rgba(234,88,12,0.3)',
    pillLight: 'bg-orange-100 border-orange-300 text-orange-700',
    pillDark: 'bg-orange-900/30 border-orange-500/40 text-orange-300',
    lockedTextLight: 'text-orange-400',
    lockedTextDark: 'text-orange-700/50',
  },
  {
    name: '7-Day Streak',
    emoji: '🔥',
    iconUrl: '/badges/streak-7day.png',
    description: 'Log activities for 7 consecutive days.',
    outerRing: 'from-[#f87171] via-[#ef4444] to-[#7f1d1d]',
    outerRingLocked: 'from-[#fecaca]/40 via-[#f87171]/25 to-[#7f1d1d]/30',
    innerBg: 'from-[#991b1b] to-[#7f1d1d]',
    innerBgLocked: 'from-[#fef2f2]/60 to-[#fee2e2]/40',
    innerBgLockedDark: 'from-[#7f1d1d]/40 to-[#450a0a]/50',
    glowDark: '0 0 28px rgba(239,68,68,0.7)',
    glowLight: '0 0 20px rgba(239,68,68,0.3)',
    pillLight: 'bg-red-100 border-red-300 text-red-700',
    pillDark: 'bg-red-900/30 border-red-500/40 text-red-300',
    lockedTextLight: 'text-red-400',
    lockedTextDark: 'text-red-700/50',
    isLottie: true,
  },
  {
    name: '10 kg Reduction',
    emoji: '🍃',
    iconUrl: '/badges/reduction-10kg.png',
    description: 'Cut your carbon footprint by 10 kg through goals.',
    outerRing: 'from-[#6ee7b7] via-[#10b981] to-[#064e3b]',
    outerRingLocked: 'from-[#a7f3d0]/40 via-[#6ee7b7]/25 to-[#064e3b]/30',
    innerBg: 'from-[#065f46] to-[#064e3b]',
    innerBgLocked: 'from-[#f0fdf4]/60 to-[#dcfce7]/40',
    innerBgLockedDark: 'from-[#064e3b]/40 to-[#022c22]/50',
    glowDark: '0 0 28px rgba(16,185,129,0.6)',
    glowLight: '0 0 18px rgba(16,185,129,0.28)',
    pillLight: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    pillDark: 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300',
    lockedTextLight: 'text-emerald-400',
    lockedTextDark: 'text-emerald-700/50',
  },
  {
    name: 'Eco Warrior',
    emoji: '⚔️',
    iconUrl: '/badges/eco-warrior.png',
    description: 'Awarded to the #3 user on the global leaderboard.',
    outerRing: 'from-[#fcd34d] via-[#d97706] to-[#78350f]',
    outerRingLocked: 'from-[#fde68a]/40 via-[#fcd34d]/25 to-[#78350f]/30',
    innerBg: 'from-[#b45309] to-[#78350f]',
    innerBgLocked: 'from-[#fffbeb]/60 to-[#fef3c7]/40',
    innerBgLockedDark: 'from-[#78350f]/40 to-[#451a03]/50',
    glowDark: '0 0 28px rgba(217,119,6,0.8)',
    glowLight: '0 0 20px rgba(217,119,6,0.35)',
    pillLight: 'bg-amber-100 border-amber-300 text-amber-700',
    pillDark: 'bg-amber-900/30 border-amber-500/40 text-amber-300',
    lockedTextLight: 'text-amber-400',
    lockedTextDark: 'text-amber-700/50',
  },
  {
    name: '25 kg Reduction',
    emoji: '🌱',
    iconUrl: '/badges/reduction-25kg.png',
    description: 'Cut your carbon footprint by 25 kg through goals.',
    outerRing: 'from-[#5eead4] via-[#0d9488] to-[#134e4a]',
    outerRingLocked: 'from-[#99f6e4]/40 via-[#5eead4]/25 to-[#134e4a]/30',
    innerBg: 'from-[#0f766e] to-[#134e4a]',
    innerBgLocked: 'from-[#f0fdfa]/60 to-[#ccfbf1]/40',
    innerBgLockedDark: 'from-[#134e4a]/40 to-[#042f2e]/50',
    glowDark: '0 0 24px rgba(13,148,136,0.6)',
    glowLight: '0 0 16px rgba(13,148,136,0.28)',
    pillLight: 'bg-teal-100 border-teal-300 text-teal-700',
    pillDark: 'bg-teal-900/30 border-teal-500/40 text-teal-300',
    lockedTextLight: 'text-teal-400',
    lockedTextDark: 'text-teal-700/50',
  },
  {
    name: 'Emission Target Master',
    emoji: '🛡️',
    iconUrl: '/badges/emission-master.png',
    description: 'Log activities on 5 or more days in a single calendar week.',
    outerRing: 'from-[#93c5fd] via-[#3b82f6] to-[#1e3a8a]',
    outerRingLocked: 'from-[#bfdbfe]/40 via-[#93c5fd]/25 to-[#1e3a8a]/30',
    innerBg: 'from-[#1d4ed8] to-[#1e3a8a]',
    innerBgLocked: 'from-[#eff6ff]/60 to-[#dbeafe]/40',
    innerBgLockedDark: 'from-[#1e3a8a]/40 to-[#172554]/50',
    glowDark: '0 0 26px rgba(59,130,246,0.7)',
    glowLight: '0 0 18px rgba(59,130,246,0.3)',
    pillLight: 'bg-blue-100 border-blue-300 text-blue-700',
    pillDark: 'bg-blue-900/30 border-blue-500/40 text-blue-300',
    lockedTextLight: 'text-blue-400',
    lockedTextDark: 'text-blue-700/50',
  },
  {
    name: '50 kg Reduction',
    emoji: '🏅',
    iconUrl: '/badges/reduction-50kg.png',
    description: 'Cut your carbon footprint by 50 kg through goals.',
    outerRing: 'from-[#fde68a] via-[#f59e0b] to-[#92400e]',
    outerRingLocked: 'from-[#fef3c7]/40 via-[#fde68a]/25 to-[#92400e]/30',
    innerBg: 'from-[#b45309] to-[#92400e]',
    innerBgLocked: 'from-[#fffbeb]/60 to-[#fef9c3]/40',
    innerBgLockedDark: 'from-[#92400e]/40 to-[#451a03]/50',
    glowDark: '0 0 30px rgba(245,158,11,0.8)',
    glowLight: '0 0 20px rgba(245,158,11,0.38)',
    pillLight: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    pillDark: 'bg-yellow-900/30 border-yellow-500/40 text-yellow-300',
    lockedTextLight: 'text-yellow-500',
    lockedTextDark: 'text-yellow-700/50',
  },
  {
    name: 'Top Saver',
    emoji: '⚡',
    iconUrl: '/badges/top-saver.png',
    description: 'Awarded to the #2 user on the global leaderboard.',
    outerRing: 'from-[#fef08a] via-[#eab308] to-[#713f12]',
    outerRingLocked: 'from-[#fef9c3]/40 via-[#fef08a]/25 to-[#713f12]/30',
    innerBg: 'from-[#ca8a04] to-[#713f12]',
    innerBgLocked: 'from-[#fefce8]/60 to-[#fef9c3]/40',
    innerBgLockedDark: 'from-[#713f12]/40 to-[#3f2307]/50',
    glowDark: '0 0 26px rgba(234,179,8,0.7)',
    glowLight: '0 0 18px rgba(234,179,8,0.32)',
    pillLight: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    pillDark: 'bg-yellow-900/30 border-yellow-400/40 text-yellow-200',
    lockedTextLight: 'text-yellow-500',
    lockedTextDark: 'text-yellow-700/50',
  },
  {
    name: 'Eco Champion',
    emoji: '🏆',
    iconUrl: '/badges/eco-champion.png',
    description: 'Achieve 3 or more completed eco-reduction goals.',
    outerRing: 'from-[#bef264] via-[#84cc16] to-[#365314]',
    outerRingLocked: 'from-[#d9f99d]/40 via-[#bef264]/25 to-[#365314]/30',
    innerBg: 'from-[#4d7c0f] to-[#365314]',
    innerBgLocked: 'from-[#f7fee7]/60 to-[#ecfccb]/40',
    innerBgLockedDark: 'from-[#365314]/40 to-[#1a2e05]/50',
    glowDark: '0 0 26px rgba(132,204,22,0.65)',
    glowLight: '0 0 18px rgba(132,204,22,0.3)',
    pillLight: 'bg-lime-100 border-lime-300 text-lime-700',
    pillDark: 'bg-lime-900/30 border-lime-500/40 text-lime-300',
    lockedTextLight: 'text-lime-500',
    lockedTextDark: 'text-lime-700/50',
  },
  {
    name: 'Earth Savior',
    emoji: '🌍',
    iconUrl: '/badges/earth-savior.png',
    description: 'Awarded to the #1 user on the global leaderboard.',
    outerRing: 'from-[#818cf8] via-[#6366f1] to-[#3730a3]',
    outerRingLocked: 'from-[#c7d2fe]/40 via-[#818cf8]/25 to-[#3730a3]/30',
    innerBg: 'from-[#4338ca] to-[#1e1b4b]',
    innerBgLocked: 'from-[#eef2ff]/60 to-[#e0e7ff]/40',
    innerBgLockedDark: 'from-[#3730a3]/40 to-[#1e1b4b]/50',
    glowDark: '0 0 36px rgba(99,102,241,0.9)',
    glowLight: '0 0 24px rgba(99,102,241,0.4)',
    pillLight: 'bg-indigo-100 border-indigo-300 text-indigo-700',
    pillDark: 'bg-indigo-900/30 border-indigo-500/40 text-indigo-300',
    lockedTextLight: 'text-indigo-400',
    lockedTextDark: 'text-indigo-700/50',
  },
  {
    name: 'Forest Guardian',
    emoji: '🌲',
    iconUrl: '/badges/forest-guardian.png',
    description: 'Prevent a cumulative 100 kg of CO₂e through completed goals.',
    outerRing: 'from-[#86efac] via-[#22c55e] to-[#14532d]',
    outerRingLocked: 'from-[#bbf7d0]/40 via-[#86efac]/25 to-[#14532d]/30',
    innerBg: 'from-[#166534] to-[#14532d]',
    innerBgLocked: 'from-[#f0fdf4]/60 to-[#dcfce7]/40',
    innerBgLockedDark: 'from-[#14532d]/40 to-[#052e16]/50',
    glowDark: '0 0 28px rgba(34,197,94,0.7)',
    glowLight: '0 0 18px rgba(34,197,94,0.3)',
    pillLight: 'bg-green-100 border-green-300 text-green-700',
    pillDark: 'bg-green-900/30 border-green-500/40 text-green-300',
    lockedTextLight: 'text-green-400',
    lockedTextDark: 'text-green-700/50',
  },
  {
    name: 'Community Leader',
    emoji: '👑',
    iconUrl: '/badges/community-leader.png',
    description: 'Rank #1 on the leaderboard with 3 or more goals achieved.',
    outerRing: 'from-[#f9a8d4] via-[#ec4899] to-[#831843]',
    outerRingLocked: 'from-[#fbcfe8]/40 via-[#f9a8d4]/25 to-[#831843]/30',
    innerBg: 'from-[#be185d] to-[#831843]',
    innerBgLocked: 'from-[#fdf2f8]/60 to-[#fce7f3]/40',
    innerBgLockedDark: 'from-[#831843]/40 to-[#500724]/50',
    glowDark: '0 0 32px rgba(236,72,153,0.8)',
    glowLight: '0 0 22px rgba(236,72,153,0.38)',
    pillLight: 'bg-pink-100 border-pink-300 text-pink-700',
    pillDark: 'bg-pink-900/30 border-pink-500/40 text-pink-300',
    lockedTextLight: 'text-pink-400',
    lockedTextDark: 'text-pink-700/50',
  },
];

/* ─── Badge Coin Component ─────────────────────────────────────────────────── */
export function BadgeCoin({ badge, isUnlocked, size = 'md', isDark, streak = 0 }) {
  const isLg = size === 'lg';

  const outerRing = isUnlocked ? badge.outerRing : badge.outerRingLocked;
  const innerBgClass = isUnlocked
    ? `bg-gradient-to-br ${badge.innerBg}`
    : isDark
      ? `bg-gradient-to-br ${badge.innerBgLockedDark}`
      : `bg-gradient-to-br ${badge.innerBgLocked}`;

  const glow = isUnlocked ? (isDark ? badge.glowDark : badge.glowLight) : 'none';

  const outerSz = isLg ? 'w-52 h-52' : 'w-28 h-28';
  const innerSz = isLg ? 'w-[11.5rem] h-[11.5rem]' : 'w-[6.2rem] h-[6.2rem]';
  const emojiSz = isLg ? 'text-[5.5rem]' : 'text-[2.6rem]';

  return (
    <div
      className={`relative flex items-center justify-center ${outerSz} transition-transform duration-300 ${!isLg ? 'group-hover:scale-105' : ''}`}
      style={{ filter: `drop-shadow(${glow})` }}
    >
      {/* Outer gradient bezel */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${outerRing} shadow-[inset_0_2px_6px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-300`} />

      {/* Inner coin plate */}
      <div className={`relative flex items-center justify-center rounded-full ${innerBgClass} ${innerSz} shadow-[inset_0_3px_10px_rgba(0,0,0,0.35)] transition-all duration-300`}>
        {/* Specular top-left highlight */}
        <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-white/20 blur-[4px] pointer-events-none" />

        {badge.isLottie && isLg ? (
          <div className="relative flex items-center justify-center w-36 h-36 overflow-hidden rounded-full">
            <DotLottieReact
              key="badge-coin-plant"
              src="/animations/growing-plant.lottie"
              loop={false}
              autoplay
              segment={[0, streak === 0 ? 1 : Math.min(135, Math.round((Math.min(7, streak) / 7) * 135))]}
              className="w-full h-full scale-110"
            />
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Lock className="w-12 h-12 text-white/60" />
              </div>
            )}
          </div>
        ) : !isUnlocked ? (
          /* Locked badge display */
          <div className="relative flex items-center justify-center w-full h-full overflow-hidden rounded-full">
            {badge.iconUrl ? (
              <img
                src={badge.iconUrl}
                alt={badge.name}
                className="w-full h-full object-cover grayscale opacity-25"
              />
            ) : (
              <span className={`${emojiSz} leading-none select-none opacity-15 absolute`}>{badge.emoji}</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className={`${isLg ? 'w-14 h-14' : 'w-7 h-7'} relative z-10 ${isDark ? badge.lockedTextDark : badge.lockedTextLight} drop-shadow-sm`} />
            </div>
          </div>
        ) : badge.iconUrl ? (
          /* Unlocked 3D Icon badge display */
          <div className="relative flex items-center justify-center w-full h-full overflow-hidden rounded-full">
            <img
              src={badge.iconUrl}
              alt={badge.name}
              className="w-full h-full object-cover transition-all"
            />
          </div>
        ) : (
          <span className={`${emojiSz} leading-none select-none`} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))' }}>
            {badge.emoji}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function BadgesPage() {
  const { user } = useAuth();
  const { triggerCelebration } = useCelebration();
  const [selected, setSelected] = useState(null);
  const { logs, fetchLogs } = useActivity();
  const { goals, fetchGoals } = useGoals();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetchLogs();
    if (fetchGoals) fetchGoals();
  }, [fetchLogs, fetchGoals]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('leaderboard-viewed'));
  }, []);

  const streak = useMemo(() => {
    if (!logs?.length) return 0;

    const formatLocal = (val) => {
      if (!val) return null;
      if (Array.isArray(val)) {
        return `${val[0]}-${String(val[1]).padStart(2, '0')}-${String(val[2]).padStart(2, '0')}`;
      }
      const s = String(val);
      return s.includes('T') ? s.split('T')[0] : s;
    };

    const logDates = new Set(logs.map((l) => formatLocal(l.logDate ?? l.date)).filter(Boolean));
    if (logDates.size === 0) return 0;

    const toDateKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayDate = new Date();
    const todayStr = toDateKey(todayDate);

    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yestStr = toDateKey(yestDate);

    let curDate = logDates.has(todayStr) ? todayDate : logDates.has(yestStr) ? yestDate : null;
    if (!curDate) return 0;

    let count = 0;
    while (true) {
      const k = toDateKey(curDate);
      if (logDates.has(k)) {
        count++;
        curDate.setDate(curDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [logs]);

  const unlockedBadges = useMemo(() => {
    const set = new Set(user?.badges || []);

    // 1. Eco Pioneer: Unlocked when user logs their 1st activity
    if (logs && logs.length > 0) {
      set.add('Eco Pioneer');
    }

    // 2. 7-Day Streak: Unlocked when logging streak reaches 7 days
    if (streak >= 7) {
      set.add('7-Day Streak');
    }

    // 3. Goal Crusher: Completed a carbon goal or logged 10+ activities
    const achievedGoals = (goals || []).filter((g) => g.status === 'ACHIEVED');
    if ((logs && logs.length >= 10) || achievedGoals.length > 0) {
      set.add('Goal Crusher');
    }

    // 4. Emission Target Master: Logged activities on 5+ days in a calendar week
    if (logs && logs.length > 0) {
      const dates = Array.from(new Set(
        logs.map((l) => {
          const d = l.logDate ?? l.date;
          if (!d) return null;
          return Array.isArray(d)
            ? `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
            : String(d).split('T')[0];
        }).filter(Boolean)
      ));

      const weekCounts = {};
      dates.forEach((dStr) => {
        const parts = dStr.split('-');
        if (parts.length === 3) {
          const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const day = dt.getDay();
          const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(dt.setDate(diff));
          const wKey = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
          weekCounts[wKey] = (weekCounts[wKey] || 0) + 1;
        }
      });
      if (Object.values(weekCounts).some((c) => c >= 5)) {
        set.add('Emission Target Master');
      }
    }

    // 5. Goal-based CO2 reduction badges & Eco Champion
    if (achievedGoals.length > 0) {
      let totalSaved = 0;
      achievedGoals.forEach((g) => {
        const target = g.target || 0;
        const current = g.current || 0;
        const saved = target - current;
        if (saved > 0) totalSaved += saved;
      });

      if (totalSaved >= 10) set.add('10 kg Reduction');
      if (totalSaved >= 25) set.add('25 kg Reduction');
      if (totalSaved >= 50) set.add('50 kg Reduction');
      if (totalSaved >= 100) set.add('Forest Guardian');
      if (achievedGoals.length >= 3) set.add('Eco Champion');
    }

    // 6. Include badges stored in user's celebration history
    try {
      const userId = user?.id || user?.username || 'guest';
      const stored = localStorage.getItem(`carbontrack_unlocked_badges_${userId}`);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          list.forEach((b) => set.add(b));
        }
      }
    } catch (e) {
      /* ignore storage errors */
    }

    return Array.from(set);
  }, [user, logs, goals, streak]);
  const selectedBadge = BADGES.find(b => b.name === selected);
  const isUnlocked = (name) => unlockedBadges.includes(name);

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto px-4 sm:px-8 pt-6 pb-16 animate-in fade-in duration-300">
      {selected && selectedBadge ? (
        /* ── SHOWCASE ── */
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-400">
          <div className="self-start mb-8">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full
                bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10
                border border-slate-200 dark:border-white/8
                text-slate-700 dark:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Collection
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-10 mt-4">
            <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-slate-300 dark:border-white/10 animate-[spin_30s_linear_infinite]" />
            <div className="absolute w-[288px] h-[288px] rounded-full border border-dashed border-slate-200 dark:border-white/5 animate-[spin_20s_linear_infinite_reverse]" />
            <BadgeCoin badge={selectedBadge} isUnlocked={isUnlocked(selectedBadge.name)} size="lg" isDark={isDark} streak={streak} />
          </div>

          {isUnlocked(selectedBadge.name) ? (
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400 text-xs uppercase tracking-widest font-extrabold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              Unlocked
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-300 text-slate-500 dark:bg-slate-800/60 dark:border-white/6 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">
              <Lock className="w-3 h-3" /> Locked
            </div>
          )}

          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-3">{selectedBadge.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-md text-center leading-relaxed mb-10">
            {isUnlocked(selectedBadge.name) ? selectedBadge.description : 'Keep logging activities and slashing emissions to unlock this rare trophy.'}
          </p>

          {selectedBadge.name === '7-Day Streak' && (
            <div className="text-sm font-bold text-orange-500 dark:text-orange-400 mb-6">Streak Progress: {streak} / 7 days</div>
          )}

          {isUnlocked(selectedBadge.name) && (
            <button
              onClick={() => triggerCelebration({
                title: '🎉 Trophy Showcase',
                badgeName: selectedBadge.name,
                emoji: selectedBadge.emoji || '🏆',
                description: selectedBadge.description,
                subtitle: 'Celebrated sustainability milestone on CarbonTrack!',
                force: true
              })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all cursor-pointer hover:scale-105 active:scale-95 mb-6"
            >
              Celebrate Achievement
            </button>
          )}
        </div>
      ) : (
        /* ── GALLERY ── */
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                {user?.username ? `${user.username}'s` : 'Your'} Trophy Room
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
                Complete eco-friendly actions and climb the leaderboard to unlock these achievements.
              </p>
            </div>
            <div className="flex-shrink-0 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/6 rounded-2xl px-5 py-3 text-right shadow-sm">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {unlockedBadges.length}
                <span className="text-slate-400 dark:text-slate-600 font-medium text-lg"> / {BADGES.length}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mt-0.5">Unlocked</div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {BADGES.map((badge) => {
              const unlocked = isUnlocked(badge.name);
              return (
                <button
                  key={badge.name}
                  onClick={() => setSelected(badge.name)}
                  className={`group relative flex flex-col items-center pt-6 pb-5 px-3 rounded-2xl border transition-all duration-300 text-left overflow-hidden cursor-pointer
                    ${unlocked
                      ? 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/18 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl shadow-sm'
                      : 'bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/70 dark:border-white/4 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                  {/* Shine sweep on unlocked */}
                  {unlocked && (
                    <div className="absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 dark:before:via-white/8 before:to-transparent before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-[800ms] pointer-events-none" />
                  )}

                  {/* Coin */}
                  <div className="mb-4">
                    <BadgeCoin badge={badge} isUnlocked={unlocked} size="md" isDark={isDark} />
                  </div>

                  {/* Name */}
                  <h3 className={`font-bold text-sm text-center leading-snug mb-1.5 transition-colors
                    ${unlocked
                      ? 'text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-500'
                    }`}>
                    {badge.name}
                  </h3>

                  {/* Description — always visible, smaller */}
                  <p className={`text-[11px] text-center leading-snug mb-4 px-1 line-clamp-2 min-h-[2.5rem]
                    ${unlocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
                    {badge.description}
                  </p>

                  {/* Status pill */}
                  {unlocked ? (
                    <span className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-black ${isDark ? badge.pillDark : badge.pillLight}`}>
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-widest font-black">
                      LOCKED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
