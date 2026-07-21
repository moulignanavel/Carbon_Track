import {
  createContext, useContext, useState,
  useCallback, useMemo, useEffect,
} from 'react';
import toast from 'react-hot-toast';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert as deleteAlertApi } from '@/api/alertApi';
import { formatError } from '@/utils/errorHandler';
import { useAuth } from '@/context/AuthContext';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { isLoggedIn } = useAuth();

  // Fetch alerts on login/mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchAlerts();
    } else {
      setAlerts([]);
    }
  }, [fetchAlerts, isLoggedIn]);

  // Re-fetch alerts whenever an activity is logged, or a goal is changed
  useEffect(() => {
    if (!isLoggedIn) return;
    const handler = () => fetchAlerts();
    window.addEventListener('activity-logged', handler);
    return () => window.removeEventListener('activity-logged', handler);
  }, [fetchAlerts, isLoggedIn]);

  // Polling for new alerts every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts, isLoggedIn]);

  const markAsRead = useCallback(async (alertId) => {
    try {
      const updated = await markAlertAsRead(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      toast.error(formatError(err, 'Failed to update alert'));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAlertsAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      toast.success('All alerts marked as read');
    } catch (err) {
      toast.error(formatError(err, 'Failed to update alerts'));
    }
  }, []);

  const deleteAlert = useCallback(async (alertId) => {
    try {
      await deleteAlertApi(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error(formatError(err, 'Failed to delete alert'));
    }
  }, []);

  const unreadCount = useMemo(() => {
    return alerts.filter((a) => !a.isRead).length;
  }, [alerts]);

  const value = useMemo(() => ({
    alerts,
    unreadCount,
    isLoading,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
  }), [alerts, unreadCount, isLoading, fetchAlerts, markAsRead, markAllAsRead, deleteAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within an AlertProvider');
  return ctx;
}
