import { useEffect, useState } from 'react';

const LEAVES = [
  { left: 4, size: 14, delay: -2.5, duration: 14, drift: 24, rotate: 250 },
  { left: 12, size: 20, delay: -11, duration: 19, drift: -18, rotate: 330 },
  { left: 21, size: 12, delay: -6, duration: 12, drift: 32, rotate: 220 },
  { left: 31, size: 17, delay: -15, duration: 20, drift: -28, rotate: 300 },
  { left: 41, size: 15, delay: -8, duration: 16, drift: 20, rotate: 270 },
  { left: 50, size: 22, delay: -4, duration: 18, drift: 38, rotate: 340 },
  { left: 59, size: 13, delay: -13, duration: 15, drift: -22, rotate: 240 },
  { left: 68, size: 18, delay: -7, duration: 17, drift: 30, rotate: 310 },
  { left: 76, size: 14, delay: -17, duration: 20, drift: -34, rotate: 280 },
  { left: 84, size: 21, delay: -9, duration: 19, drift: 26, rotate: 360 },
  { left: 91, size: 12, delay: -3, duration: 13, drift: -20, rotate: 230 },
  { left: 96, size: 16, delay: -12, duration: 18, drift: -30, rotate: 320 },
];

export default function FallingLeaves({ className = '' }) {
  const [paused, setPaused] = useState(() => document.hidden);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${paused ? '[&_*]:[animation-play-state:paused!important]' : ''} ${className}`}
    >
      {LEAVES.map((leaf, index) => (
        <svg
          key={`${leaf.left}-${leaf.size}`}
          viewBox="0 0 24 24"
          className={`falling-leaf-item absolute -top-7 fill-emerald-100 opacity-[0.09] ${
            index >= 5 ? 'hidden md:block' : 'block'
          }`}
          style={{
            left: `${leaf.left}%`,
            width: leaf.size,
            height: leaf.size,
            animationDelay: `${leaf.delay}s`,
            '--leaf-duration': `${leaf.duration}s`,
            '--leaf-drift': `${leaf.drift}px`,
            '--leaf-rotation': `${leaf.rotate}deg`,
          }}
          focusable="false"
        >
          <path d="M20.8 3.2C13.4 3.5 7.1 6.1 4.4 11c-1.8 3.2-.9 6.6 1.3 8.4 1.8-4.7 5.4-8.1 10.7-10.3-4.4 2.8-7.5 6.5-9.1 10.8 2.8 1 6.2.2 8.4-2.5 3.4-4.2 4.7-9.2 5.1-14.2Z" />
        </svg>
      ))}

      <style>{`
        .falling-leaf-item {
          animation: fallingLeaf var(--leaf-duration) linear infinite;
          will-change: transform;
        }
        @keyframes fallingLeaf {
          0% {
            transform: translate3d(0, -24px, 0) rotate(0deg);
            opacity: 0;
          }
          12% { opacity: .09; }
          52% {
            transform: translate3d(calc(var(--leaf-drift) * -.35), 55vh, 0)
              rotate(calc(var(--leaf-rotation) * .52));
          }
          88% { opacity: .09; }
          100% {
            transform: translate3d(var(--leaf-drift), 110vh, 0)
              rotate(var(--leaf-rotation));
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .falling-leaf-item { animation: none !important; display: none !important; }
        }
      `}</style>
    </div>
  );
}
