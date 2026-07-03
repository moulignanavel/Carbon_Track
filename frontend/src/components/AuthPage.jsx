import React, { useState } from 'react';
import { api } from '../utils/api';
import { Lock, Mail, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await api.login(email, password);
      } else {
        await api.register(username, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center min-h-screen px-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        {/* Title / Logo */}
        <div className="text-center mb-8">
          <div className="flex-center gap-2 mb-2">
            <Sparkles className="text-blue-500 w-8 h-8" />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-glow-primary" style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Carbontrack
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            {isLogin ? 'Welcome back! Monitor your carbon footprint.' : 'Start your sustainability journey today.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-red-200 bg-red-950/40 border border-red-800/30 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switch */}
        <div className="flex gap-2 p-1 mb-6 bg-slate-950/50 rounded-xl border border-white/5">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="sustain_champion"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
