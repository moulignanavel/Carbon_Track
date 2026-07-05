/**
 * AuthLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Shell for all unauthenticated pages (login, register,
 * forgot-password).
 *
 * Layout:
 *   Desktop  — left green brand panel + right form panel (50/50)
 *   Tablet   — compact centered card on gradient background
 *   Mobile   — full-width card, brand strip at top
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Leaf, TrendingDown, Shield, Award } from 'lucide-react';

const FEATURES = [
  { icon: TrendingDown, text: 'Track your daily carbon emissions' },
  { icon: Shield,       text: 'Set goals and stay within budget'  },
  { icon: Award,        text: 'Earn badges for sustainable habits' },
];

/** Small stat pill used in the left panel */
function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/70 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen">

      {/* ── Left brand panel (hidden on mobile) ─────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #14532d 0%, #166534 35%, #0f766e 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-teal-400/10" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-green-400/10" />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
            <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="text-lg font-bold text-white leading-none">CarbonTrack</span>
            <p className="text-[11px] text-white/60 mt-0.5">Sustainability Platform</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-snug">
              Reduce your<br />
              <span className="text-green-300">carbon footprint</span><br />
              every day.
            </h1>
            <p className="mt-4 text-white/70 text-base leading-relaxed max-w-xs">
              Log activities, visualise your impact, and hit your sustainability goals — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* Social proof stats */}
          <div className="flex gap-3">
            <StatPill value="12k+" label="Active users"    />
            <StatPill value="98%"  label="Satisfaction"    />
            <StatPill value="Free" label="Always free tier" />
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} CarbonTrack. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-h-screen bg-slate-50 dark:bg-slate-950">

        {/* Mobile brand strip */}
        <div className="lg:hidden flex items-center justify-center gap-2.5 pt-8 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-teal-600 shadow-sm">
            <Leaf className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">CarbonTrack</span>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-[440px]">
            <Outlet />
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex items-center justify-center gap-4 pb-6 text-xs text-slate-400 dark:text-slate-600">
          <span>© {new Date().getFullYear()} CarbonTrack</span>
          <span>·</span>
          <Link to="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Terms</Link>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '0.875rem',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  );
}
