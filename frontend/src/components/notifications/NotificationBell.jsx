import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import alertService from '@/services/api/alertService';
import NotificationDrawer from './NotificationDrawer';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await alertService.getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Re-fetch on activity creation or period interval
    const interval = setInterval(fetchAlerts, 60000);
    const handleActivityLogged = () => fetchAlerts();
    window.addEventListener('activity-created', handleActivityLogged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('activity-created', handleActivityLogged);
    };
  }, [fetchAlerts]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch (err) {
      toast.error('Failed to update alert');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark alerts as read');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const msg = await alertService.sendTestEmail();
      toast.success(typeof msg === 'string' ? msg : 'Test email sent! Check your inbox.');
    } catch (err) {
      toast.error('Failed to dispatch test email');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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
