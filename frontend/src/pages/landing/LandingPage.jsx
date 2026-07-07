/**
 * LandingPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Public marketing landing page for CarbonTrack.
 * Features a premium visual design with a hero section, features list,
 * stats block, and call-to-action buttons.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Leaf, TrendingDown, Shield, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import heroVideo from '@/assets/hero.mp4';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleStartClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between relative overflow-hidden bg-emerald-950 font-sans transition-colors duration-500">
      
      {/* Keyframe Animations & Background Mesh */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-35px) scale(1.08); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(35px) scale(0.92); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-float-1 {
          animation: float-slow 14s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-reverse 16s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-slow 20s ease-in-out infinite 2s;
        }
        .landing-mesh {
          background: radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 45%),
                      radial-gradient(circle at 90% 80%, rgba(52, 211, 153, 0.1) 0%, transparent 45%),
                      radial-gradient(circle at 50% 50%, rgba(4, 120, 87, 0.2) 0%, transparent 60%);
        }
      `}</style>

      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-emerald-950/80 z-10" /> {/* Overlay to keep text readable */}
        <video 
          src={heroVideo}
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
      </div>

      {/* Background Glowing Blurs (Full Page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none landing-mesh z-0" aria-hidden="true">
        <div className="absolute top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[130px] animate-float-1" />
        <div className="absolute bottom-[8%] right-[10%] h-[550px] w-[550px] rounded-full bg-green-400/10 blur-[130px] animate-float-2" />
        <div className="absolute top-[50%] left-[65%] h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[110px] animate-float-3" />
        
        {/* Dot pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-landing" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="currentColor" className="text-emerald-100" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots-landing)" />
        </svg>
      </div>

      {/* ── Navbar ────────────────────────────────────────── */}
      <header className="relative z-10 w-full px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900/50 backdrop-blur-md border border-emerald-700/50 shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
            <Leaf className="h-5.5 w-5.5 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-black text-white leading-none tracking-tight">CarbonTrack</span>
            <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-300/70 mt-0.5">Sustainability Platform</p>
          </div>
        </Link>

        <div>
          <Button 
            variant="glass" 
            size="sm" 
            onClick={handleStartClick}
            className="font-semibold px-5"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </Button>
        </div>
      </header>

      {/* ── Main Hero Copy & Cards ────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto space-y-16">
        
        {/* Top Hero Section (Centered Layout) */}
        <div className="flex flex-col items-center text-center gap-8 w-full pt-8 md:pt-16 max-w-4xl mx-auto">
          
          {/* Tagline */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 backdrop-blur-sm text-emerald-200 border border-emerald-700/50 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Empowering Eco-Conscious Living
          </span>

          {/* Hero text */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
            Reduce your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">carbon footprint</span><br />
            every single day.
          </h1>
          
          <p className="text-base sm:text-xl text-emerald-100/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow">
            Track your daily travel, energy, and food habits. Set personal goals, earn sustainable badges, and see your live impact in real-time.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartClick}
              rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
              className="px-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 transition-all font-bold"
            >
              Get Started
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 backdrop-blur-md bg-white/5 hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8">
          <div className="bg-emerald-900/40 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-6 shadow-lg shadow-emerald-950/50 hover:bg-emerald-800/50 hover:-translate-y-1 transition-all duration-300 text-left space-y-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-800/80 border border-emerald-600/50 group-hover:scale-105 transition-transform duration-200 shadow-inner">
              <TrendingDown className="h-5 w-5 text-emerald-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Emission Tracker</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
              Log activities like transport, grid electricity usage, and food servings using real-time calculated conversions.
            </p>
          </div>

          <div className="bg-emerald-900/40 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-6 shadow-lg shadow-emerald-950/50 hover:bg-emerald-800/50 hover:-translate-y-1 transition-all duration-300 text-left space-y-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-900/80 border border-teal-700/50 group-hover:scale-105 transition-transform duration-200 shadow-inner">
              <Shield className="h-5 w-5 text-teal-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Target Budgets</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
              Set custom weekly, monthly, or yearly carbon reduction budgets and watch progress update in real-time as you log.
            </p>
          </div>

          <div className="bg-emerald-900/40 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-6 shadow-lg shadow-emerald-950/50 hover:bg-emerald-800/50 hover:-translate-y-1 transition-all duration-300 text-left space-y-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-900/80 border border-green-700/50 group-hover:scale-105 transition-transform duration-200 shadow-inner">
              <Award className="h-5 w-5 text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Streak Rewards</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
              Compete on the community leaderboards and unlock rare badges for maintaining consistency and saving emissions.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/60 font-medium border-t border-emerald-800/50 pt-6">
        <span>© {new Date().getFullYear()} CarbonTrack. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="#" className="hover:text-emerald-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="#" className="hover:text-emerald-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}