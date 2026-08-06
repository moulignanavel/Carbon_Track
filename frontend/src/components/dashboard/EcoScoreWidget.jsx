import { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Award } from 'lucide-react';
import ecoScoreService from '@/services/api/ecoScoreService';
import LazyLottie from '@/components/common/LazyLottie';
import plantAnimation from '@/assets/lottie/eco-plant.json';

export default function EcoScoreWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ecoScoreService
      .getEcoScore()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load Eco Score:', err))
      .finally(() => setLoading(false));

    const handleActivity = () => {
      ecoScoreService.getEcoScore().then((res) => setData(res)).catch(() => {});
    };

    window.addEventListener('activity-logged', handleActivity);
    return () => window.removeEventListener('activity-logged', handleActivity);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-52 flex items-center justify-center">
        <div className="text-xs text-slate-400 font-medium">Calculating Eco Score...</div>
      </div>
    );
  }

  const score = data?.score || 720;
  const rating = data?.rating || 'Good';
  const color = data?.color || '#10b981';
  const percentile = data?.percentile || 80;
  const breakdown = data?.breakdown || { emissionScore: 280, streakScore: 190, goalScore: 200 };
  const tips = data?.tips || ["Keep maintaining your active logging habit to boost score!"];

  // Normalize score for 180-degree gauge fill (300 to 850 = range 550)
  // Arc radius = 50 => Arc length = Math.PI * 50 = 157.08
  const pct = Math.max(0, Math.min(1, (score - 300) / 550));
  const arcLength = 157.08;
  const strokeDashoffset = arcLength * (1 - pct);

  return (
    <div className="p-6 bg-white dark:bg-slate-900/90 rounded-3xl border border-emerald-100/80 dark:border-slate-800 shadow-xl shadow-emerald-500/5 relative overflow-hidden backdrop-blur-md">
      {/* Background Accent Ambient Glow */}
      <div
        className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-15 dark:opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Pixel-Perfect SVG Arc Gauge Dial */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full sm:w-auto">
          <div className="relative w-48 h-28 flex items-center justify-center">
            <svg className="w-48 h-28 overflow-visible" viewBox="0 0 120 70">
              {/* Background Arc Track */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800/80"
                strokeLinecap="round"
              />
              {/* Active Filled Score Arc */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Score Value & Subtext rendered directly inside SVG vector */}
              <text
                x="60"
                y="43"
                textAnchor="middle"
                className="fill-slate-900 dark:fill-slate-100 font-extrabold text-3xl tracking-tight"
                style={{ fontSize: '26px', fontWeight: 800 }}
              >
                {score}
              </text>
              <text
                x="60"
                y="57"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-bold tracking-widest uppercase"
                style={{ fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.12em' }}
              >
                OUT OF 850
              </text>
            </svg>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className="px-3.5 py-1 rounded-full text-xs font-extrabold text-white shadow-md flex items-center gap-1"
              style={{ backgroundColor: color }}
            >
              <span>{rating}</span>
              <Sparkles className="h-3 w-3 fill-current" />
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              Top {100 - percentile}%
            </span>
          </div>
        </div>

        {/* Right Side: Score Breakdown Bars & Insights */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Sustainability Eco Score
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Dynamic environmental rating based on emissions, streak, & targets
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" /> Live Rating
            </span>
          </div>

          {/* 3 Component Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                <span>Emission Rating</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{breakdown.emissionScore}/350</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.emissionScore / 350) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                <span className="flex items-center gap-1">
                  <span>Streak Bonus</span>
                  <div className="w-4 h-4 shrink-0 inline-flex items-center justify-center">
                    <LazyLottie animationData={plantAnimation} height={16} width={16} loop={true} />
                  </div>
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-extrabold">{breakdown.streakScore}/250</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.streakScore / 250) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                <span>Goals Impact</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{breakdown.goalScore}/250</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.goalScore / 250) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Eco Tips List */}
          {tips.length > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-300 pt-0.5 space-y-1.5">
              {tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
