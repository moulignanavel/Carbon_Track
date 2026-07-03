import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ActivityForm from './components/ActivityForm';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Load user data and activity logs
  const loadUserData = async () => {
    if (!api.isAuthenticated()) return;
    setLoading(true);
    try {
      const profile = await api.getProfile();
      setCurrentUser(profile);
      
      const userLogs = await api.getLogs();
      setLogs(userLogs || []);
    } catch (err) {
      console.error('Error loading user data:', err);
      // If unauthorized, clear local session
      if (err.message.includes('Unauthorized') || err.message.includes('JWT') || err.message.includes('token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLogs([]);
  };

  const handleLogSuccess = (newLog) => {
    // Add the new log immediately and trigger a full refresh to be safe
    setLogs((prev) => [...prev, newLog]);
    // Optionally trigger soft background load to keep in sync
    loadUserData();
  };

  const handleProfileUpdate = (updatedProfile) => {
    setCurrentUser(updatedProfile);
  };

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen pb-16 bg-[#070b13]">
      <Navbar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading && logs.length === 0 ? (
          <div className="flex-center py-20 flex-col gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-400">Loading your carbon data...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard logs={logs} />}
            {activeTab === 'log' && <ActivityForm onLogSuccess={handleLogSuccess} />}
            {activeTab === 'settings' && <ProfileSettings onProfileUpdate={handleProfileUpdate} />}
          </>
        )}
      </main>
    </div>
  );
}
