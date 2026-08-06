import { useEffect, useState } from 'react';

const particles = [
  { left: '8%', top: '18%', size: 4, delay: '-2s', duration: '14s' },
  { left: '26%', top: '72%', size: 5, delay: '-7s', duration: '17s' },
  { left: '48%', top: '30%', size: 3, delay: '-4s', duration: '13s' },
  { left: '69%', top: '78%', size: 4, delay: '-9s', duration: '16s' },
  { left: '88%', top: '24%', size: 5, delay: '-5s', duration: '18s' },
];

export default function OrganisationEcoBackground() {
  const [paused, setPaused] = useState(() => document.hidden);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.08] ${
        paused ? '[&_*]:[animation-play-state:paused!important]' : ''
      }`}
    >
      <div className="absolute inset-0 animate-[organisationGradient_18s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,.55),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(16,185,129,.4),transparent_32%)] motion-reduce:animate-none" />

      <div className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
      <div className="absolute -right-20 top-[42%] h-80 w-80 rounded-full bg-green-500 blur-3xl" />
      <div className="absolute bottom-[-120px] left-[35%] h-72 w-72 rounded-full bg-teal-400 blur-3xl" />

      {particles.map((particle, index) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className={`absolute rounded-full bg-emerald-700 animate-[organisationParticle_var(--eco-duration)_ease-in-out_infinite] motion-reduce:animate-none ${
            index > 2 ? 'hidden md:block' : ''
          }`}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            '--eco-duration': particle.duration,
          }}
        />
      ))}

      <style>{`
        @keyframes organisationGradient {
          0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1%, 0) scale(1.05); }
        }
        @keyframes organisationParticle {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(10px, -22px, 0); }
        }
      `}</style>
    </div>
  );
}
