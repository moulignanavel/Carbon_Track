import { useState } from 'react';
import { Award, ShieldCheck, Target, Leaf, ChevronLeft, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BadgesPage() {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState(null);

  // We map backend badge strings to rich objects.
  const badgeDefinitions = {
    'Goal Crusher': {
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)] dark:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
      border: 'border-purple-300 dark:border-purple-500/50',
      bgColor: 'bg-purple-100 dark:bg-purple-900/40',
      bgGradient: 'from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-950/80',
      description: 'Completed a goal while staying strictly under the emission limit.',
    },
    'Emission Target Master': {
      icon: ShieldCheck,
      color: 'text-blue-600 dark:text-blue-400',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)] dark:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
      border: 'border-blue-300 dark:border-blue-500/50',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
      bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-950/80',
      description: 'Maintained a flawless track record of meeting emission targets.',
    },
    'Top Saver': {
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)] dark:shadow-[0_0_30px_rgba(245,158,11,0.5)]',
      border: 'border-amber-300 dark:border-amber-500/50',
      bgColor: 'bg-amber-100 dark:bg-amber-900/40',
      bgGradient: 'from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-950/80',
      description: 'Recognized as one of the top carbon savers this month.',
    },
    'Eco Champion': {
      icon: Leaf,
      color: 'text-green-600 dark:text-green-400',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)] dark:shadow-[0_0_30px_rgba(34,197,94,0.5)]',
      border: 'border-green-300 dark:border-green-500/50',
      bgColor: 'bg-green-100 dark:bg-green-900/40',
      bgGradient: 'from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-950/80',
      description: 'Overall dedication to a sustainable lifestyle and low footprint.',
    },
    'Community Leader': {
      icon: Award,
      color: 'text-rose-600 dark:text-rose-400',
      glow: 'shadow-[0_0_30px_rgba(225,29,72,0.4)] dark:shadow-[0_0_30px_rgba(225,29,72,0.5)]',
      border: 'border-rose-300 dark:border-rose-500/50',
      bgColor: 'bg-rose-100 dark:bg-rose-900/40',
      bgGradient: 'from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-950/80',
      description: 'Awarded to top contributors who inspire others in the community leaderboard.',
    },
    '7-Day Streak': {
      icon: Target,
      color: 'text-orange-500 dark:text-orange-400',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)] dark:shadow-[0_0_30px_rgba(249,115,22,0.5)]',
      border: 'border-orange-300 dark:border-orange-500/50',
      bgColor: 'bg-orange-100 dark:bg-orange-900/40',
      bgGradient: 'from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-950/80',
      description: 'Consistently logged activities for 7 consecutive days.',
    },
    'Forest Guardian': {
      icon: Leaf,
      color: 'text-teal-500 dark:text-teal-400',
      glow: 'shadow-[0_0_30px_rgba(20,184,166,0.4)] dark:shadow-[0_0_30px_rgba(20,184,166,0.5)]',
      border: 'border-teal-300 dark:border-teal-500/50',
      bgColor: 'bg-teal-100 dark:bg-teal-900/40',
      bgGradient: 'from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-950/80',
      description: 'Achieved an incredible milestone of 1 Tonne of CO2 saved.',
    }
  };

  const getBadgeDef = (badgeName) => badgeDefinitions[badgeName] || {
    icon: Award,
    color: 'text-slate-600 dark:text-slate-400',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)] dark:shadow-[0_0_30px_rgba(148,163,184,0.5)]',
    border: 'border-slate-300 dark:border-slate-500/50',
    bgColor: 'bg-slate-100 dark:bg-slate-800/40',
    bgGradient: 'from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-900/80',
    description: 'Special achievement unlocked.',
  };

  const unlockedBadges = user?.badges || [];

  return (
    <div className="flex flex-col animate-in fade-in duration-300 h-full w-full">
      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col pt-4 pb-12 px-2 sm:px-8 overflow-y-auto">
        
        {/* Showcase Mode */}
        {selectedBadge ? (() => {
          const def = getBadgeDef(selectedBadge);
          const Icon = def.icon;
          return (
            <div className="w-full h-full flex flex-col relative animate-in zoom-in-95 duration-500">
              {/* Absolute top positioning for the button so it sits near the top left corner */}
              <div className="absolute top-0 left-0 z-20">
                  <button 
                    onClick={() => setSelectedBadge(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-all font-medium border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Collection
                  </button>
              </div>

              {/* Centered Showcase Content */}
              <div className="flex flex-col items-center justify-center w-full text-center pt-16">
              <div className="relative mb-16 mt-8">
                {/* Outer decorative ring */}
                <div className={`absolute inset-[-40px] rounded-full border border-dashed ${def.border} opacity-50 animate-[spin_10s_linear_infinite]`} />
                
                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] ${def.bgColor} opacity-60 animate-pulse mix-blend-multiply dark:mix-blend-screen`} />
                
                {/* The Spinning Badge */}
                <div className={`relative w-72 h-72 rounded-full bg-gradient-to-br ${def.bgGradient} flex items-center justify-center animate-spin-y border-[12px] border-white dark:border-slate-900/80 ${def.glow} backdrop-blur-sm`}>
                  <div className={`absolute inset-0 rounded-full border-2 ${def.border} opacity-50`} />
                  <Icon className={`w-36 h-36 ${def.color} drop-shadow-2xl`} />
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-50 dark:bg-white/5 border border-green-200 dark:border-white/10 text-green-700 dark:text-white/90 text-sm uppercase tracking-[0.2em] font-bold mb-8 shadow-sm dark:shadow-xl">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                Achievement Unlocked
              </div>

              <h3 className={`text-5xl sm:text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-white/50 mb-6 tracking-tight drop-shadow-sm dark:drop-shadow-lg`}>
                {selectedBadge}
              </h3>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
                {def.description}
              </p>
              </div>
            </div>
          );
        })() : (
          /* Gallery Mode */
          <div className="w-full max-w-7xl mx-auto flex flex-col">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] shrink-0">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {user?.username}'s Trophy Room
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {unlockedBadges.length} Achievement{unlockedBadges.length !== 1 ? 's' : ''} Unlocked
                </p>
              </div>
            </div>

            {Object.keys(badgeDefinitions).length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg dark:shadow-2xl mb-6">
                  <Award className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Your showcase is empty</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md leading-relaxed px-4">
                  Start tracking activities and crushing your emission targets to earn exclusive badges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
                {Object.keys(badgeDefinitions).map((badgeName, index) => {
                  const def = getBadgeDef(badgeName);
                  const Icon = def.icon;
                  const isUnlocked = unlockedBadges.includes(badgeName);
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => isUnlocked && setSelectedBadge(badgeName)}
                      className={`relative group flex flex-col items-center p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden ${isUnlocked ? 'hover:border-green-400 dark:hover:border-green-500 cursor-pointer hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-2xl' : 'opacity-80 hover:opacity-100 grayscale-[0.85] hover:grayscale-0'}`}
                    >
                      {/* Background hover glow effect */}
                      {isUnlocked && <div className={`absolute inset-0 bg-gradient-to-b ${def.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />}
                      
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 relative z-10 border-[6px] transition-colors duration-300 ${isUnlocked ? `bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 group-hover:${def.border} ${def.glow}` : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                        <Icon className={`w-14 h-14 ${isUnlocked ? `${def.color} group-hover:scale-110 drop-shadow-md` : 'text-slate-400 dark:text-slate-500'} transition-transform duration-500`} />
                        {!isUnlocked && (
                          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-900 shadow-sm">
                             <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-3 text-center tracking-tight relative z-10">
                         {badgeName}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center line-clamp-2 relative z-10 font-medium">
                        {isUnlocked ? def.description : 'Keep tracking your impact to unlock this achievement!'}
                      </p>
                      
                      <div className={`mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 relative z-10`}>
                        <span className={`text-xs uppercase tracking-wider font-bold ${isUnlocked ? def.color : 'text-slate-500'}`}>
                          {isUnlocked ? 'Click to View' : 'Locked'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
