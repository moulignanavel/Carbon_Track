import React from 'react';
import { LogOut, Leaf, User, BarChart3, Settings, PlusCircle } from 'lucide-react';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }) {
  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 mb-8 rounded-none border-t-0 border-x-0 bg-opacity-80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Carbontrack
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/90 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'log'
                ? 'bg-blue-600/90 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Log Activity
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600/90 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* User profile details and Logout */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">
                {currentUser.username}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5 hover:bg-red-500/5 hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
