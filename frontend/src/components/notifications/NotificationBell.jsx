import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import alertService from '@/services/api/alertService';
import NotificationDrawer from './NotificationDrawer';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const previousAlertIdsRef = useRef(null);

  const fetchAlerts = useCallback(async (notifyOnError = false) => {
    try {
      const data = await alertService.getAlerts();
      const newAlerts = Array.isArray(data) ? data : [];

      // Detect newly arrived unread alerts for real-time toast popups
      if (previousAlertIdsRef.current !== null) {
        const prevIds = new Set(previousAlertIdsRef.current);
        const incomingNew = newAlerts.filter((a) => !a.isRead && !prevIds.has(a.id));

        incomingNew.forEach((alert) => {
          toast(
            (t) => (
              <div className="flex items-start gap-2.5 p-0.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  🔔
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{alert.alertType || 'Real-time Alert'}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{alert.message}</p>
                </div>
              </div>
            ),
            { duration: 4500, id: `realtime-alert-${alert.id}` }
          );
        });
      }

      previousAlertIdsRef.current = newAlerts.map((a) => a.id);
      setAlerts(newAlerts);
    } catch {
      if (notifyOnError) toast.error('Unable to load notifications');
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Fast 8-second real-time poll
    const interval = setInterval(fetchAlerts, 8000);
    const handleEvents = () => fetchAlerts();

    window.addEventListener('activity-created', handleEvents);
    window.addEventListener('goal-updated', handleEvents);
    window.addEventListener('goal-created', handleEvents);
    window.addEventListener('employee-updated', handleEvents);
    window.addEventListener('organisation-updated', handleEvents);

    return () => {
      clearInterval(interval);
      window.removeEventListener('activity-created', handleEvents);
      window.removeEventListener('goal-updated', handleEvents);
      window.removeEventListener('goal-created', handleEvents);
      window.removeEventListener('employee-updated', handleEvents);
      window.removeEventListener('organisation-updated', handleEvents);
    };
  }, [fetchAlerts]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch {
      toast.error('Failed to update alert');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark alerts as read');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const msg = await alertService.sendTestEmail();
      toast.success(typeof msg === 'string' ? msg : 'Test email sent! Check your inbox.');
    } catch {
      toast.error('Failed to dispatch test email');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          fetchAlerts(true);
        }}
        aria-label="Open notifications"
        className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-800"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-md ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteAlert={handleDeleteAlert}
        onSendTestEmail={handleSendTestEmail}
      />
    </>
  );
}
