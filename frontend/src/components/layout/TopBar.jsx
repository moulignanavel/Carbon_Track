import { useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAlerts } from '@/context/AlertContext';

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
          const { alerts, unreadCount, fetchAlerts, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
          return (
            <div className="relative">
              <button
                onClick={() => { setNotifOpen((o) => !o); fetchAlerts(); }}
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {/* unread dot */}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 card-glass rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 scale-in overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                  onMouseLeave={() => setNotifOpen(false)}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-green-600 dark:text-green-400 cursor-pointer hover:underline"
                      >
                        Mark all read
                      </span>
                    )}
                  </div>
                  <ul className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {alerts.length === 0 ? (
                      <li className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No notifications yet
                      </li>
                    ) : (
                      alerts.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => !n.isRead && markAsRead(n.id)}
                          className={`group flex items-start gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-green-50/50 dark:hover:bg-slate-800/50 cursor-pointer ${!n.isRead ? 'bg-green-50/20 dark:bg-green-950/10' : ''}`}
                        >
                          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${!n.isRead ? 'bg-green-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`leading-snug text-xs ${!n.isRead ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAlert(n.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all"
                            aria-label="Delete notification"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
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
