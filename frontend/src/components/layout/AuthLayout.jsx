/**
 * AuthLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-page shell for all unauthenticated pages (login, register,
 * forgot-password) with extremely premium modern design.
 * Centered card with glowing ambient background, no splits!
 */

import { useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Leaf } from 'lucide-react';
import heroVideo from '@/assets/hero.mp4';
import heroImage from '@/assets/hero_illustration.png';

export default function AuthLayout() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  }, []);

  return (
    <div className="dark min-h-screen w-screen flex flex-col justify-between relative overflow-hidden bg-[#06140F] font-sans transition-colors duration-500 text-slate-300">
      
      <style>{`
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* FULL PAGE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center" aria-hidden="true">
        <div className="absolute inset-0 bg-[#06140F]/90 z-0" />
        
        <div 
          className="w-full h-full absolute z-10 opacity-20 mix-blend-lighten"
          style={{ 
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)', 
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' 
          }}
        >
          <video
            ref={videoRef}
            src={heroVideo}
            poster={heroImage}
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 grain z-20 opacity-30" />
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#7FBF8C]/[0.05] blur-[120px] z-20" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#E8C468]/[0.04] blur-[100px] z-20" />
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
        <div className="w-full max-w-[540px]">
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
