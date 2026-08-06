/**
 * ActivityContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global activity log state.
 *
 * Exposed:
 *   logs            — ActivityLog[]
 *   isLoading       — boolean
 *   fetchLogs()     — async () => void
 *   addLog()        — async (data) => ActivityLog
 *   deleteLog()     — (id) => void
 *   totalEmissions  — number  (sum of calculatedEmissions)
 */

import { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getActivityLogs, createActivityLog } from '@/api';
import { formatError } from '@/utils/errorHandler';
import ActivityContext from './activityContextValue';
import { useAuth } from '@/context/AuthContext';

/* ─── Provider ──────────────────────────────────────────────────── */
export function ActivityProvider({ children }) {
  const [logs,      setLogs]      = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestVersion = useRef(0);
  const { isLoggedIn, user } = useAuth();

  /* ── fetch ─────────────────────────────────────────────────── */
  const fetchLogs = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    try {
      const data = await getActivityLogs();
      if (version === requestVersion.current) setLogs(data);
    } catch (err) {
      if (version === requestVersion.current) {
        toast.error(formatError(err, 'Failed to load activity logs'));
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, []);

  // Server data remains permanent; only account-specific in-memory state is
  // cleared on logout. A login or account switch reloads that user's records.
  useEffect(() => {
    requestVersion.current += 1;
    setLogs([]);
    setIsLoading(false);
    if (isLoggedIn && user?.userId) fetchLogs();
  }, [fetchLogs, isLoggedIn, user?.userId]);

  /* ── add ───────────────────────────────────────────────────── */
  const addLog = useCallback(async (logData) => {
    try {
      const newLog = await createActivityLog(logData);
      // Optimistically prepend so the user sees it instantly...
      setLogs((prev) => [newLog, ...prev]);
      // ...then sync with server to guarantee the list is accurate.
      // (Catches edge-cases where the backend returns a shape mismatch)
      setTimeout(async () => {
        try {
          const data = await getActivityLogs();
          setLogs(data);
        } catch (_) { /* ignore background refresh errors */ }
      }, 300);
      window.dispatchEvent(new CustomEvent('activity-created', { detail: { newLog, logCount: logs.length + 1 } }));
      window.dispatchEvent(new Event('activity-logged'));
      // Fire a second delayed event so goals + alerts re-fetch AFTER the backend
      // has finished its async goal-evaluation and alert-creation (takes ~500ms)
      setTimeout(() => window.dispatchEvent(new Event('activity-logged')), 1500);
      return newLog;
    } catch (err) {
      toast.error(formatError(err, 'Failed to save activity'));
      throw err; // re-throw so the form knows it failed
    }
  }, []);

  /* ── delete ────────────────────────────────────────────────── */
  const deleteLog = useCallback((id) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.success('Activity deleted');
  }, []);

  /* ── derived ───────────────────────────────────────────────── */
  const totalEmissions = useMemo(
    () => logs.reduce((sum, l) => sum + (l.calculatedEmissions ?? 0), 0),
    [logs]
  );

  const value = useMemo(() => ({
    logs,
    isLoading,
    fetchLogs,
    addLog,
    deleteLog,
    totalEmissions,
  }), [logs, isLoading, fetchLogs, addLog, deleteLog, totalEmissions]);

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────────── */
export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within an ActivityProvider');
  return ctx;
}
