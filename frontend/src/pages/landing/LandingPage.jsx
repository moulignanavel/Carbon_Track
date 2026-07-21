/**
 * LandingPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Public marketing landing page for CarbonTrack.
 * Login on the right. Hero visual is a "ring" gauge: each ring is a
 * month of tracked emissions, echoing how tree rings record history.
 * Warm amber sits alongside moss green so the palette isn't one note.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, TrendingDown, Zap, Target, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import LoginPage from '@/pages/auth/LoginPage';
import DataNodeGrid from '@/components/landing/DataNodeGrid';

const READINGS = [
  {
    tag: 'Daily',
    value: '3 taps',
    icon: Zap,
    title: 'Log in seconds',
    body: 'Log transport, power, or meals with a few taps. Get real-time carbon conversion using verified factors.',
  },
  {
    tag: 'Target',
    value: 'Live',
    icon: Target,
    title: 'Active Budgets',
    body: 'Set monthly limits and watch your remaining balance update live as you log.',
  },
  {
    tag: 'Global',
    value: '#1-#50',
    icon: Trophy,
    title: 'Leaderboards',
    body: 'Compete with friends and earn badges. Stay consistent to keep your green streak alive.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleStartClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      document.getElementById('login-email')?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative font-sans bg-[#030712] overflow-hidden">

      <style>{`
        @keyframes ring-draw {
          from { stroke-dashoffset: var(--ring-len); }
          to { stroke-dashoffset: 0; }
        }
        @keyframes count-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ring-path {
          animation: ring-draw 1.4s ease-out forwards;
        }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* FULL PAGE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#090d16] to-[#030712] z-0" />
        <DataNodeGrid />
        <div className="absolute inset-0 grain z-20 opacity-20" />
        <div className="absolute top-[10%] right-[15%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[150px] z-20" />
        <div className="absolute bottom-[15%] left-[5%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.02] blur-[120px] z-20" />
      </div>

      {/* ── Left Pane Content ──────────────────────── */}
      <div className="relative flex-1 flex flex-col justify-start z-10 min-h-screen w-full lg:w-[58%]">
        {/* Navbar */}
        <header className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2E22] border border-[#1E4432] group-hover:border-[#5FA37A] transition-colors duration-300">
              <Leaf className="h-5 w-5 text-[#7FBF8C]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-black text-[#F3EFE4] leading-none tracking-tight">CarbonTrack</span>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#7FBF8C]/70 mt-0.5">Sustainability Platform</p>
            </div>
          </Link>

          <div className="lg:hidden">
            <Button variant="glass" size="sm" onClick={handleStartClick} className="font-semibold px-5">
              {isLoggedIn ? 'Dashboard' : 'Sign In'}
            </Button>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-12 pb-24">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-10 items-center lg:items-start">

            {/* Copy */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-7">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#0F2E22]/70 text-[#9CC9AC] border border-[#1E4432]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8C468]" />
                  Built for daily use
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2E22]/70 border border-[#1E4432]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7FBF8C]" style={{ animation: 'count-blink 2s ease-in-out infinite' }} />
                  <span className="text-[11px] font-mono font-medium text-[#9CC9AC]">
                    182,450 kg CO₂e logged this month
                  </span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F3EFE4] leading-[1.15] tracking-tight">
                Track your carbon <br />
                footprint in <span className="text-[#4ADE80]">seconds</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#E2E8F0] font-normal leading-relaxed max-w-lg">
                Log daily emissions, set monthly budgets, and see your impact in real time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                {isLoggedIn && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartClick}
                    rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
                    className="px-8 bg-[#7FBF8C] hover:bg-[#94D1A0] text-[#06140F] font-bold"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Readings, separated into distinct cards */}
          <div id="readings-section" className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {READINGS.map((r) => (
              <div key={r.tag} className="h-full bg-[#081A13]/80 backdrop-blur p-6 flex flex-col gap-3 rounded-2xl border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0F2E22] rounded-lg border border-[#1E4432]">
                      <r.icon className="h-4 w-4 text-[#7FBF8C]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#7FBF8C]">{r.tag}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#E8C468]">{r.value}</span>
                </div>
                <h3 className="text-base font-bold text-[#F3EFE4] mt-1">{r.title}</h3>
                <p className="text-sm text-[#E2E8F0] leading-relaxed font-normal">{r.body}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B7A67] font-medium">
          <span>© {new Date().getFullYear()} CarbonTrack. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="#" className="hover:text-[#9CC9AC] transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="#" className="hover:text-[#9CC9AC] transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </div>

      {/* ── Right Pane Content ──────────────────────────── */}
      <div className="w-full lg:w-[42%] relative lg:sticky lg:top-0 h-auto lg:h-screen flex items-center justify-center p-6 sm:p-12 shrink-0 z-20">
        <div className="w-full max-w-md relative z-10">
          {!isLoggedIn ? (
            <LoginPage />
          ) : (
            <div className="flex flex-col items-center justify-center bg-[#0F2E22]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 aspect-square text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#7FBF8C]/20 blur-2xl rounded-full" />
                <Leaf className="h-20 w-20 text-[#7FBF8C] relative z-10" />
              </div>
              <h2 className="text-2xl font-black text-[#F3EFE4] mb-3 tracking-tight">You are signed in</h2>
              <p className="text-[#9FAFA5] text-sm mb-8 leading-relaxed font-medium">Ready to log your daily activities and track your carbon footprint?</p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartClick}
                className="w-full bg-[#7FBF8C] hover:bg-[#94D1A0] text-[#06140F] font-black"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}