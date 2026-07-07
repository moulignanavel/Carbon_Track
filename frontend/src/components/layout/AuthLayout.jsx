/**
 * AuthLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-page shell for all unauthenticated pages (login, register,
 * forgot-password) with extremely premium modern design.
 * Centered card with glowing ambient background, no splits!
 */

import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Leaf } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="dark min-h-screen w-screen flex flex-col justify-between relative overflow-hidden bg-emerald-950 font-sans transition-colors duration-500 text-slate-300">
      
      {/* Dynamic Keyframe Animations & Background Mesh */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(30px) scale(0.9); }
        }
        @keyframes rotate-bg {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float-1 {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-reverse 15s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-slow 18s ease-in-out infinite 2s;
        }
        .full-mesh-bg {
          background: radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 45%),
                      radial-gradient(circle at 90% 80%, rgba(52, 211, 153, 0.1) 0%, transparent 45%),
                      radial-gradient(circle at 50% 50%, rgba(4, 120, 87, 0.2) 0%, transparent 60%);
        }
      `}</style>

      {/* Background Glowing Blurs (Full Page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none full-mesh-bg" aria-hidden="true">
        {/* Large green/teal glowing blobs that float around */}
        <div className="absolute top-[10%] left-[15%] h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[120px] animate-float-1" />
        <div className="absolute bottom-[10%] right-[15%] h-[450px] w-[450px] rounded-full bg-green-400/10 blur-[120px] animate-float-2" />
        <div className="absolute top-[60%] left-[70%] h-[350px] w-[350px] rounded-full bg-teal-500/15 blur-[100px] animate-float-3" />
        
        {/* Dot pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-full" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="currentColor" className="text-emerald-100" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots-full)" />
        </svg>
      </div>

      {/* ── Top Header Brand ───────────────────────────────── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 flex justify-center lg:justify-start">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900/50 backdrop-blur-md border border-emerald-700/50 shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
            <Leaf className="h-5.5 w-5.5 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-black text-white leading-none tracking-tight">CarbonTrack</span>
            <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-300/70 mt-0.5">Sustainability Platform</p>
          </div>
        </Link>
      </header>

      {/* ── Center Content ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/60 font-medium">
        <span>© {new Date().getFullYear()} CarbonTrack. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="#" className="hover:text-emerald-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="#" className="hover:text-emerald-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '1.25rem',
            fontSize: '0.875rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          },
        }}
      />
    </div>
  );
}
