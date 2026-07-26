import React, { useEffect, useRef } from 'react';
import { Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BADGES } from '@/pages/badges/BadgesPage';

/**
 * Custom HTML5 Canvas Particle Confetti Generator
 */
function runConfetti(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const colors = ['#10b981', '#059669', '#34d399', '#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6'];
  const particleCount = 70;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2,
      y: height / 2 - 50,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      gravity: 0.35,
    });
  }

  let animationFrameId;

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (particles.some((p) => p.opacity > 0)) {
      animationFrameId = requestAnimationFrame(render);
    }
  };

  render();

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
  };
}

export default function CelebrationModal({ isOpen, celebrationData, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const stopConfetti = runConfetti(canvasRef.current);
      return () => stopConfetti();
    }
  }, [isOpen]);

  if (!isOpen || !celebrationData) return null;

  const { title, badgeName, emoji, description, subtitle } = celebrationData;

  // Look up matching badge definition from BADGES registry for exact theme colors
  const badgeObj = BADGES.find((b) => b.name === badgeName) || {
    name: badgeName || 'Achievement',
    emoji: emoji || '🏆',
    outerRing: 'from-emerald-500 via-teal-400 to-amber-400',
    innerBg: 'from-emerald-700 to-teal-950',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-300">
      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Dynamic Glow backdrop ring */}
        <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-gradient-to-br ${badgeObj.outerRing} blur-3xl opacity-30 pointer-events-none`} />

        {/* Close Icon */}
        <button
          onClick={onClose}
          aria-label="Close celebration modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Coin Showcase */}
        <div className="relative mx-auto my-4 flex items-center justify-center">
          {/* Outer glowing aura ring */}
          <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-tr ${badgeObj.outerRing} animate-pulse blur-md opacity-75`} />

          {/* Styled Badge Circle */}
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${badgeObj.outerRing} p-1 shadow-2xl flex items-center justify-center`}>
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${badgeObj.innerBg} flex items-center justify-center shadow-inner relative overflow-hidden`}>
              {/* Specular glass highlight */}
              <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-white/25 blur-[2px] pointer-events-none" />
              <span className="text-4xl select-none animate-bounce" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
                {badgeObj.emoji || emoji || '🏆'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          {title || 'Achievement Unlocked'}
        </div>

        {/* Badge Name */}
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 mb-2 tracking-tight">
          {badgeName || 'Eco Pioneer'}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto mb-6">
          {description || 'Congratulations on reaching a major sustainability milestone on CarbonTrack!'}
        </p>

        {/* Subtitle / Tip callout box */}
        {subtitle && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
              {subtitle}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onClose}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Awesome! Keep Going
        </Button>
      </div>
    </div>
  );
}
