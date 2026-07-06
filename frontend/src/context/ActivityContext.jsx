/**
 * ActivityContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global activity log state.
 *
 * Mock mode (default): seeded with MOCK_LOGS, addLog() appends
 * locally. Flip USE_MOCK to false and uncomment the real API
 * calls when the backend is running.
 *
 * Exposed:
 *   logs            — ActivityLog[]
 *   isLoading       — boolean
 *   fetchLogs()     — async () => void
 *   addLog()        — async (data) => ActivityLog
 *   deleteLog()     — (id) => void
 *   totalEmissions  — number  (sum of calculatedEmissions)
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { MOCK_LOGS } from '@/data/activitiesMock';

/* ── toggle this flag when the backend is ready ─────────────── */
const USE_MOCK = false;

/* ── real API imports (used when USE_MOCK = false) ──────────── */
import { getActivityLogs, createActivityLog } from '@/api';
import { formatError } from '@/utils/errorHandler';

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const [logs,      setLogs]      = useState(USE_MOCK ? MOCK_LOGS : []);
  const [isLoading, setIsLoading] = useState(false);

  /* ── fetch ─────────────────────────────────────────────────── */
  const fetchLogs = useCallback(async () => {
    if (USE_MOCK) return; // already seeded
    setIsLoading(true);
    try {
      const data = await getActivityLogs();
      setLogs(data);
    } catch (err) {
      toast.error(formatError(err, 'Failed to load activity logs'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── add ───────────────────────────────────────────────────── */
  const addLog = useCallback(async (logData) => {
    if (USE_MOCK) {
      const newLog = {
        ...logData,
        id: Date.now(),
        activityLabel: logData.activityLabel ?? logData.activityType,
      };
      setLogs((prev) => [newLog, ...prev]);
      return newLog;
    }
    const newLog = await createActivityLog(logData);
    setLogs((prev) => [newLog, ...prev]);
    // Notify GoalContext (and any other listeners) that an activity was added
    // so they can re-fetch updated goal progress without a page refresh.
    window.dispatchEvent(new Event('activity-logged'));
    return newLog;
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

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within an ActivityProvider');
  return ctx;
}
