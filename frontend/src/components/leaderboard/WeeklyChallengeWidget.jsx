import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { getChallenges, joinChallenge } from '@/api/challengeApi';
import Button from '@/components/ui/Button';

export default function WeeklyChallengeWidget({ challenge: initialChallenge }) {
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState(initialChallenge || null);
  const [isLoading, setIsLoading] = useState(!initialChallenge);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (initialChallenge) {
      setActiveChallenge(initialChallenge);
      return;
    }

    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        const challenges = await getChallenges();
        if (challenges && challenges.length > 0) {
          // Prefer joined/in-progress challenge first, else first available challenge
          const inProgress = challenges.find(c => c.status === 'IN_PROGRESS' || c.status === 'COMPLETED');
          setActiveChallenge(inProgress || challenges[0]);
        }
      } catch (err) {
        console.error('Failed to load challenge for widget:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [initialChallenge]);

  const handleJoin = async () => {
    if (!activeChallenge) return;
    try {
      setIsJoining(true);
      const updated = await joinChallenge(activeChallenge.id);
      setActiveChallenge(updated);
    } catch (err) {
      console.error('Failed to join challenge:', err);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg animate-pulse h-48 flex items-center justify-center">
        <p className="text-xs text-slate-400">Loading active challenge…</p>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 border border-emerald-700/40 shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
          <Trophy className="w-4 h-4" />
          <span>Eco Challenges</span>
        </div>
        <p className="text-sm font-bold text-white mb-2">No Active Challenge</p>
        <p className="text-xs text-slate-300 mb-4">
          Join community sustainability challenges to earn XP rewards and milestone badges!
        </p>
        <Button
          onClick={() => navigate('/challenges')}
          className="text-xs px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
        >
          Browse Challenges
        </Button>
      </div>
    );
  }

  const title = activeChallenge.title || 'Weekly Challenge';
  const objective = activeChallenge.description || 'Reduce emissions this week';
  const currentProgress = activeChallenge.progressValue || 0;
  const targetProgress = activeChallenge.targetValue || 20;
  const pct = activeChallenge.progressPct ? Math.min(100, Math.round(activeChallenge.progressPct)) : Math.min(100, Math.round((currentProgress / targetProgress) * 100));
  const isJoined = activeChallenge.status === 'IN_PROGRESS' || activeChallenge.status === 'COMPLETED';
  const isCompleted = activeChallenge.status === 'COMPLETED';
  const xpReward = activeChallenge.xpReward || 150;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 border border-emerald-700/40 shadow-lg relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            {activeChallenge.period ? `${activeChallenge.period.toUpperCase()} CHALLENGE` : 'WEEKLY CHALLENGE'}
          </span>
          <span className="text-[11px] text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Active
          </span>
        </div>
        <span className="text-xs font-black text-emerald-400">{pct}%</span>
      </div>

      {/* Challenge Info */}
      <h4 className="text-base font-extrabold text-white mb-1 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-300 mb-3 line-clamp-2">
        {objective}
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
          <span>Progress</span>
          <span className="text-emerald-300 font-bold">
            {currentProgress.toFixed(1)} / {targetProgress} {activeChallenge.metricType === 'REDUCE_EMISSIONS' ? 'kg CO₂' : 'units'}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-emerald-800/60">
        <div className="flex items-center gap-2">
          <span className="text-base">🏆</span>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Reward</p>
            <p className="text-xs font-bold text-emerald-300">+{xpReward} XP Reward</p>
          </div>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        ) : isJoined ? (
          <Button
            onClick={() => navigate('/challenges')}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1"
          >
            View Details <ArrowRight className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
          >
            {isJoining ? 'Joining…' : 'Join Challenge'}
          </Button>
        )}
      </div>
    </div>
  );
}
