import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Bell, CheckCheck, Trash2, Calendar, Flame, Target, ShieldAlert, Check } from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  alerts = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteAlert,
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  const FILTER_TABS = [
    { id: 'all', label: t('common.all', { defaultValue: 'All' }) },
    { id: 'unread', label: t('common.unread', { defaultValue: 'Unread' }) },
    { id: 'warnings', label: t('common.warnings', { defaultValue: 'Warnings' }) },
    { id: 'reminders', label: t('common.reminders', { defaultValue: 'Reminders' }) },
  ];

  const filteredAlerts = useMemo(() => {
    if (activeTab === 'unread') return alerts.filter((a) => !a.isRead);
    if (activeTab === 'warnings')
      return alerts.filter((a) =>
        ['THRESHOLD_BREACH', 'WEEKLY_BUDGET_BREACH', 'GOAL_OFF_TRACK', 'GOAL_WARNING'].includes(a.alertType)
      );
    if (activeTab === 'reminders')
      return alerts.filter((a) => ['LOGGING_REMINDER', 'ACTIVITY_LOGGED', 'ECO_BADGE_UNLOCKED'].includes(a.alertType));
    return alerts;
  }, [alerts, activeTab]);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  if (!isOpen) return null;

  const getAlertIcon = (type) => {
    switch (type) {
      case 'WEEKLY_BUDGET_BREACH':
      case 'THRESHOLD_BREACH':
        return (
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800">
            <Flame className="w-5 h-5" />
          </div>
        );
      case 'LOGGING_REMINDER':
        return (
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'GOAL_OFF_TRACK':
      case 'GOAL_WARNING':
        return (
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800">
            <Target className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300 z-[9999]"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-[10000]">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('nav.notifications', { defaultValue: 'Notifications' })}</h2>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/40">
                  {unreadCount} {t('common.new', { defaultValue: 'new' })}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar & Filter Tabs */}
          <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mark All as Read button */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('common.readAll', { defaultValue: 'Read all' })}</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 dark:text-slate-500">
                <ShieldAlert className="w-12 h-12 mb-2 opacity-50 stroke-[1.5]" />
                <p className="text-sm font-semibold">{t('common.noNotifications', { defaultValue: 'No notifications' })}</p>
                <p className="text-xs mt-0.5">{t('common.allCaughtUp', { defaultValue: "You're all caught up on your carbon alerts!" })}</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    !alert.isRead
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {getAlertIcon(alert.alertType)}

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {alert.alertType ? alert.alertType.replace(/_/g, ' ') : 'ALERT'}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {alert.message}
                      </p>

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block font-mono">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : t('common.justNow', { defaultValue: 'Just now' })}
                      </span>
                    </div>

                    {/* Alert Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {!alert.isRead && (
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          title={t('common.markAsRead', { defaultValue: 'Mark as read' })}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        title={t('common.deleteNotification', { defaultValue: 'Delete notification' })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

