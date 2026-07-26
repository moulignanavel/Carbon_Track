import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, Lock, Trophy } from 'lucide-react';
import { BADGES, BadgeCoin } from '@/pages/badges/BadgesPage';
import { useActivity } from '@/context/ActivityContext';

export default function BadgeSidebar({ isOpen, onClose, user }) {
  const [selected, setSelected] = useState(null);
  const { logs, fetchLogs } = useActivity();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const streak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const dates = Array.from(
      new Set(
        logs
          .map((l) => {
            const d = l.logDate ?? l.date;
            if (!d) return null;
            if (Array.isArray(d)) {
              const y = d[0];
              const m = String(d[1]).padStart(2, '0');
              const day = String(d[2]).padStart(2, '0');
              return `${y}-${m}-${day}`;
            }
            return d.split('T')[0];
          })
          .filter(Boolean)
      )
    ).sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentTargetDate = null;
    if (dates.includes(todayStr)) {
      currentTargetDate = new Date();
    } else if (dates.includes(yesterdayStr)) {
      currentTargetDate = yesterday;
    } else {
      return 0;
    }

    let count = 0;
    while (true) {
      const targetStr = currentTargetDate.toISOString().split('T')[0];
      if (dates.includes(targetStr)) {
        count++;
        currentTargetDate.setDate(currentTargetDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [logs]);

  const unlockedBadges = useMemo(() => {
    const set = new Set(user?.badges || []);

    if (logs && logs.length > 0) {
      set.add('Eco Pioneer');
    }
    if (streak >= 7) {
      set.add('7-Day Streak');
    }
    if (logs && logs.length >= 10) {
      set.add('Goal Crusher');
    }

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
  }, [user, logs, streak]);

  if (!isOpen) return null;

  const selectedBadge = BADGES.find(b => b.name === selected);
  const isUnlocked = (name) => unlockedBadges.includes(name);

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Absolute Top Floating Buttons: Back (Left Screen Corner) & Close X (Right Screen Corner) */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {selected ? (
          <button
            onClick={() => setSelected(null)}
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all font-semibold text-sm cursor-pointer shadow-md border border-slate-200 dark:border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Collection
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleClose}
          className="pointer-events-auto p-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-md cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Centered Content Area */}
      <div className="flex-1 w-full overflow-y-auto px-4 sm:px-12 pb-16 pt-20 flex flex-col items-center">
        {selected && selectedBadge ? (
          /* SHOWCASE MODE: Centered Showcase View */
          <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 max-w-2xl w-full my-auto text-center py-4">
            <div className="relative flex items-center justify-center mb-10">
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

            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {selectedBadge.name}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-base max-w-md leading-relaxed font-medium">
              {isUnlocked(selectedBadge.name) ? selectedBadge.description : 'Keep logging activities and slashing emissions to unlock this rare trophy.'}
            </p>
          </div>
        ) : (
          /* GALLERY MODE - PERFECTLY CENTERED */
          <div className="w-full max-w-7xl flex flex-col items-center mx-auto">
            {/* Centered Header Section */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-emerald-500" />
                  {user?.username ? `${user.username}'s` : 'My'} Trophy Room
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xl leading-relaxed">
                  Complete eco-friendly actions and climb the leaderboard to unlock these achievements.
                </p>
              </div>
              <div className="flex-shrink-0 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-3.5 text-right shadow-sm">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {unlockedBadges.length}
                  <span className="text-slate-400 dark:text-slate-600 font-medium text-xl"> / {BADGES.length}</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mt-0.5">Unlocked</div>
              </div>
            </div>

            {/* Grid of 13 Badges - Centered */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 w-full justify-center justify-items-center">
              {BADGES.map((badge) => {
                const unlocked = isUnlocked(badge.name);
                return (
                  <button
                    key={badge.name}
                    onClick={() => setSelected(badge.name)}
                    className={`group relative flex flex-col items-center pt-7 pb-6 px-4 rounded-3xl border transition-all duration-300 text-left overflow-hidden cursor-pointer w-full max-w-[240px]
                      ${unlocked
                        ? 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/18 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-2xl shadow-sm'
                        : 'bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/70 dark:border-white/4 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                  >
                    {/* Shine sweep on unlocked */}
                    {unlocked && (
                      <div className="absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 dark:before:via-white/8 before:to-transparent before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-[800ms] pointer-events-none" />
                    )}

                    {/* 3D Coin */}
                    <div className="mb-5 flex items-center justify-center">
                      <BadgeCoin badge={badge} isUnlocked={unlocked} size="md" isDark={isDark} />
                    </div>

                    {/* Name */}
                    <h3 className={`font-bold text-base text-center leading-snug mb-1.5 transition-colors
                      ${unlocked
                        ? 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300'
                        : 'text-slate-500 dark:text-slate-500'
                      }`}>
                      {badge.name}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs text-center leading-relaxed mb-5 px-1 line-clamp-2 min-h-[2.5rem]
                      ${unlocked ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
                      {badge.description}
                    </p>

                    {/* Status pill */}
                    {unlocked ? (
                      <span className={`px-4 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-black ${isDark ? badge.pillDark : badge.pillLight}`}>
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-widest font-black bg-slate-100/50 dark:bg-slate-800/40">
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
    </div>
  );
}
