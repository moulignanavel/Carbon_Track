import { useState } from 'react';
import { X, Award, ShieldCheck, Target, Leaf, ChevronLeft } from 'lucide-react';

export default function BadgeSidebar({ isOpen, onClose, user }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (!isOpen) return null;

  // We map backend badge strings to rich objects.
  // Using theme colors (amber, blue, purple) for variety, but green is prominent.
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

  const badges = user?.badges || [];

  const handleClose = () => {
    setSelectedBadge(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-8 py-6 z-20 absolute top-0 w-full">
        {selectedBadge ? (
          <button 
            onClick={() => setSelectedBadge(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-all font-medium border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 backdrop-blur-md shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Collection
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user?.username}'s Trophy Room
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {badges.length} Achievement{badges.length !== 1 ? 's' : ''} Unlocked
              </p>
            </div>
          </div>
        )}
        <button 
          onClick={handleClose}
          className="p-3 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-all border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 backdrop-blur-md shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex items-center justify-center pt-24 pb-12 px-8 overflow-y-auto">
        
        {/* Showcase Mode */}
        {selectedBadge ? (() => {
          const def = getBadgeDef(selectedBadge);
          const Icon = def.icon;
          return (
            <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 w-full max-w-2xl text-center">
              <div className="relative mb-16">
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
              
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-50 dark:bg-white/5 border border-green-200 dark:border-white/10 text-green-700 dark:text-white/90 text-sm uppercase tracking-[0.2em] font-bold mb-8 backdrop-blur-md shadow-sm dark:shadow-xl">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                Achievement Unlocked
              </div>

              <h3 className={`text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-white/50 mb-6 tracking-tight drop-shadow-sm dark:drop-shadow-lg`}>
                {selectedBadge}
              </h3>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
                {def.description}
              </p>
            </div>
          );
        })() : (
          /* Gallery Mode */
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
            {badges.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg dark:shadow-2xl mb-8">
                  <Award className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Your showcase is empty</h3>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                  Start tracking activities and crushing your emission targets to earn exclusive badges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full mt-12">
                {badges.map((badgeName, index) => {
                  const def = getBadgeDef(badgeName);
                  const Icon = def.icon;
                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedBadge(badgeName)}
                      className={`relative group flex flex-col items-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-2xl overflow-hidden`}
                    >
                      {/* Background hover glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${def.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      <div className={`w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-6 relative z-10 border-[6px] border-slate-100 dark:border-slate-800 group-hover:${def.border} transition-colors duration-300 ${def.glow}`}>
                        <Icon className={`w-14 h-14 ${def.color} group-hover:scale-110 transition-transform duration-500 drop-shadow-md`} />
                      </div>
                      
                      <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-3 text-center tracking-tight relative z-10">{badgeName}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center line-clamp-2 relative z-10 font-medium">
                        {def.description}
                      </p>
                      
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 relative z-10">
                        <span className={`text-xs uppercase tracking-wider font-bold ${def.color}`}>
                          Click to View
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
