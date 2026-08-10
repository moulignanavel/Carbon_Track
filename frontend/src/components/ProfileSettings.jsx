import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import { ShieldCheck, User, Mail, Globe, Eye, CheckCircle2 } from 'lucide-react';

export default function ProfileSettings({ onProfileUpdate }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [preferredUnit, setPreferredUnit] = useState('km');
  const [goalVisibility, setGoalVisibility] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile();
        if (profile) {
          setUsername(profile.username);
          setEmail(profile.email);
          if (profile.sustainabilityPreferences) {
            setPreferredUnit(profile.sustainabilityPreferences.preferredUnit || 'km');
            setGoalVisibility(
              profile.sustainabilityPreferences.goalVisibility !== undefined 
                ? profile.sustainabilityPreferences.goalVisibility 
                : true
            );
          }
          if (profile.isAnonymous !== undefined) {
            setIsAnonymous(profile.isAnonymous);
          }
          if (profile.anonymousName !== undefined) {
            setAnonymousName(profile.anonymousName || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.updateProfile(username, email, preferredUnit, goalVisibility, isAnonymous, anonymousName);
      setMessage(t('settingsPage.profileUpdatedSuccess', { defaultValue: 'Profile settings updated successfully!' }));
      if (onProfileUpdate) {
        onProfileUpdate(response);
      }
    } catch (err) {
      setError(err.message || t('settingsPage.profileUpdateError', { defaultValue: 'Failed to update profile settings' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('settingsPage.profileTitle', { defaultValue: 'Profile & Preferences' })}</h2>
            <p className="text-sm text-gray-400">{t('settingsPage.profileSubtitle', { defaultValue: 'Manage settings for unit measurements and visibility' })}</p>
          </div>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="flex items-center gap-2 p-4 mb-6 text-sm text-emerald-200 bg-emerald-950/40 border border-emerald-800/30 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 text-sm text-red-200 bg-red-950/40 border border-red-800/30 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{t('auth.username', { defaultValue: 'Username' })}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{t('auth.email', { defaultValue: 'Email Address' })}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{t('settingsPage.preferredUnitSystem', { defaultValue: 'Preferred Unit System' })}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-500" />
                </span>
                <select
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  value={preferredUnit}
                  onChange={(e) => setPreferredUnit(e.target.value)}
                >
                  <option value="km" className="bg-slate-900">{t('settingsPage.unitMetric', { defaultValue: 'Metric (km / kWh / servings)' })}</option>
                  <option value="miles" className="bg-slate-900">{t('settingsPage.unitImperial', { defaultValue: 'Imperial (miles / kWh / servings)' })}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{t('settingsPage.goalVisibility', { defaultValue: 'Goal Visibility' })}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Eye className="h-5 w-5 text-gray-500" />
                </span>
                <select
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  value={goalVisibility ? 'public' : 'private'}
                  onChange={(e) => setGoalVisibility(e.target.value === 'public')}
                >
                  <option value="public" className="bg-slate-900">{t('settingsPage.visibilityPublic', { defaultValue: 'Public (Visible to Organization)' })}</option>
                  <option value="private" className="bg-slate-900">{t('settingsPage.visibilityPrivate', { defaultValue: 'Private (Only me)' })}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{t('settingsPage.leaderboardAnonymity', { defaultValue: 'Leaderboard Anonymity' })}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-500" />
                </span>
                <select
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  value={isAnonymous ? 'anonymous' : 'public'}
                  onChange={(e) => setIsAnonymous(e.target.value === 'anonymous')}
                >
                  <option value="public" className="bg-slate-900">{t('settingsPage.anonymityPublic', { defaultValue: 'Public (Show my username on leaderboard)' })}</option>
                  <option value="anonymous" className="bg-slate-900">{t('settingsPage.anonymityPrivate', { defaultValue: 'Anonymous (Hide my username on leaderboard)' })}</option>
                </select>
              </div>
            </div>

            {isAnonymous && (
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                  {t('settingsPage.anonymousName', { defaultValue: 'Anonymous Display Name / Alias' })}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-emerald-500" />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-emerald-500/30 rounded-xl text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. EcoNinja, GreenGuardian (optional)"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {anonymousName.trim()
                    ? `Displayed on leaderboard as: "${anonymousName.trim()}"`
                    : 'If left blank, a default "Anonymous User #ID" will be assigned.'}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {loading ? t('settingsPage.savingSettings', { defaultValue: 'Saving Settings...' }) : t('settingsPage.saveSettings', { defaultValue: 'Save Settings' })}
          </button>
        </form>
      </div>
    </div>
  );
}

