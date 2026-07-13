import { useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth }  from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function TopBar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6">

      {/* Hamburger — mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="hidden md:block text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark
            ? <Sun  className="h-4 w-4" aria-hidden="true" />
            : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {/* unread dot */}
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 card-glass rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 scale-in overflow-hidden z-50"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <ul>
                {[
                  { id: 1, msg: 'You logged 2.4 kg CO₂e today', time: '2m ago',  unread: true },
                  { id: 2, msg: 'Monthly goal is 80% reached',   time: '1h ago',  unread: true },
                  { id: 3, msg: 'New badge earned: Green Starter', time: '2d ago', unread: false },
                ].map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-green-50/50 dark:hover:bg-slate-800/50 ${n.unread ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.unread ? 'bg-green-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`leading-snug ${n.unread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.msg}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
