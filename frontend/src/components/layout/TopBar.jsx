import { useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAlerts } from '@/context/AlertContext';
import NotificationDrawer from '@/components/notifications/NotificationDrawer';

import alertService from '@/services/api/alertService';
import toast from 'react-hot-toast';

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

export default function TopBar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#cdd8c9] dark:border-white/5 bg-[#eaf0e6]/90 dark:bg-[#030712]/75 backdrop-blur-md px-4 md:px-6">

      {/* Hamburger — mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>


      <div className="ml-auto flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark
            ? <Sun className="h-4 w-4" aria-hidden="true" />
            : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        {/* Notifications */}
        {(() => {
          const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
          return (
            <>
              <button
                onClick={() => setNotifOpen(true)}
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
                )}
              </button>

              <NotificationDrawer
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                alerts={alerts}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteAlert={deleteAlert}
              />
            </>
          );
        })()}

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

        {/* User menu */}
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Account menu"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white text-xs font-bold uppercase overflow-hidden">
            {user?.avatarUrl ? (
              <img src={`http://localhost:8080${user.avatarUrl}`} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              user?.username?.charAt(0) ?? 'U'
            )}
          </div>
          <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[96px] truncate">
            {user?.username}
          </span>
          <LogOut className="hidden sm:block h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
