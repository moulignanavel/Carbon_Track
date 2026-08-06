import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronDown, Globe, LogOut, Menu, Moon, Search, Sun, UserCircle, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import OrganisationSidebar from './OrganisationSidebar';
import OrganisationEcoBackground from './OrganisationEcoBackground';

const pageMeta = {
  dashboard: ['Organisation Dashboard', 'Monitor your organisation’s sustainability performance.'],
  analytics: ['Analytics', 'Explore performance trends and sustainability insights.'],
  employees: ['Employees', 'Review employee participation and carbon performance.'],
  'monthly-trends': ['Monthly Trends', 'Track how emissions change over time.'],
  departments: ['Department Comparison', 'Compare carbon performance across departments.'],
  goals: ['Organisation Goals', 'Create and track sustainability targets.'],
  'top-contributors': ['Top Contributors', 'Recognise employees making the greatest verified impact.'],
  'lowest-footprint': ['Lowest Footprint', 'View employees with the lowest verified carbon footprint.'],
  reports: ['CSR Reports', 'Generate and download organisation sustainability reports.'],
  'activity-logs': ['Activity Logs', 'Review verified sustainability activity across your organisation.'],
  profile: ['Organisation Profile', 'Manage organisation details and sustainability settings.'],
  'my-profile': ['My Profile', 'Manage your organisation administrator profile.'],
};

const ORG_SEARCH_DESTINATIONS = [
  { label: 'Organisation Dashboard', to: '/organisation/dashboard' },
  { label: 'Emissions Analytics', to: '/organisation/analytics' },
  { label: 'Employee Directory', to: '/organisation/employees' },
  { label: 'Monthly Trends', to: '/organisation/monthly-trends' },
  { label: 'Department Comparison', to: '/organisation/departments' },
  { label: 'Sustainability Goals', to: '/organisation/goals' },
  { label: 'Top Contributors', to: '/organisation/top-contributors' },
  { label: 'CSR & ESG Reports', to: '/organisation/reports' },
  { label: 'Activity Logs', to: '/organisation/activity-logs' },
  { label: 'Organisation Profile', to: '/organisation/profile' },
  { label: 'Admin Profile', to: '/organisation/my-profile' },
];

export default function OrganisationLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const reduceMotion = useReducedMotion();

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'en';
  const segment = pathname === '/organisation' ? 'dashboard' : pathname.split('/').filter(Boolean).at(-1);
  const [title, subtitle] = pageMeta[segment] || ['Organisation Portal', 'Sustainability management workspace.'];

  const results = ORG_SEARCH_DESTINATIONS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  // Scroll detection for sticky shadow & blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const closeMenus = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenus);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenus);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const selectSearchResult = (to) => {
    navigate(to);
    setQuery('');
    setSearchOpen(false);
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const orgDisplayName = user?.organisationName || user?.companyName || user?.organisation || 'Enterprise CSR Portal';

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      <div className="organisation-module relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Toaster position="top-right" toastOptions={{ duration: 3200, className: 'org-toast' }} />
        <OrganisationEcoBackground />
        <div className="relative z-10 flex min-h-screen">
          <OrganisationSidebar
            open={drawerOpen}
            collapsed={collapsed}
            onClose={() => setDrawerOpen(false)}
            onCollapse={() => setCollapsed((value) => !value)}
          />
          <div className="min-w-0 flex-1">
            {/* ── Enterprise Sticky Navbar Header ───────────────────────── */}
            <header
              className={`sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 transition-all duration-300 md:h-[68px] md:px-6 ${
                scrolled
                  ? 'border-slate-200/90 bg-white/90 shadow-md shadow-slate-950/5 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/40'
                  : 'border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80'
              }`}
            >
              {/* Left Brand & Section info */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-base font-extrabold tracking-tight text-slate-950 dark:text-white md:text-lg">
                        {title}
                      </h1>
                      <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        CSR Enterprise
                      </span>
                    </div>
                    <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
                      {orgDisplayName} · {subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Search Input */}
              <div className="hidden min-w-0 max-w-xs flex-1 md:block lg:max-w-sm" ref={searchRef}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && results[0]) selectSearchResult(results[0].to);
                    }}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-xs text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:bg-slate-900"
                    placeholder="Search organisation workspace…"
                    aria-label="Search organisation portal"
                  />
                  {searchOpen && query.trim() && (
                    <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900 z-50">
                      {results.length ? (
                        results.map((item) => (
                          <button
                            key={item.to}
                            type="button"
                            onClick={() => selectSearchResult(item.to)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span>{item.label}</span>
                            <span className="text-[10px] text-slate-400">Go →</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-slate-500">No matching section found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {/* Language Selector */}
                <div className="relative items-center hidden sm:flex">
                  <Globe className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={currentLanguage}
                    onChange={(event) => handleLanguageChange(event.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white/80 pl-8 pr-2 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                    aria-label="Select language"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ்</option>
                    <option value="hi">हिंदी</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                {/* Theme Toggle */}
                <button
                  type="button"
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  onClick={toggleTheme}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Notifications Bell */}
                <NotificationBell />

                <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    aria-label={`Open profile menu for ${user?.username || 'Organisation Admin'}`}
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-1 pr-2 transition hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {(user?.username || 'O').charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden md:block max-w-[100px] truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      {user?.username || 'Admin'}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                        className="org-profile-menu absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 z-50"
                      >
                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {user?.username || 'Organisation Admin'}
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            CSR Administrator
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            {orgDisplayName}
                          </p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            to="/organisation/my-profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                          >
                            <UserCircle className="h-3.5 w-3.5 text-slate-500" />
                            My Profile
                          </Link>
                          <Link
                            to="/organisation/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                          >
                            <Building2 className="h-3.5 w-3.5 text-slate-500" />
                            Organisation Profile
                          </Link>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            type="button"
                            onClick={logout}
                            className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* ── Dashboard Content Container ──────────────────────────── */}
            <main className="mx-auto w-full max-w-[1600px] p-4 [&_.recharts-cartesian-axis-tick-value]:fill-slate-500 [&_.recharts-legend-item-text]:text-slate-600 dark:[&_.bg-white]:bg-slate-900 dark:[&_.bg-slate-50]:bg-slate-800/60 dark:[&_.bg-slate-100]:bg-slate-800 dark:[&_.border-slate-100]:border-slate-800 dark:[&_.border-slate-200]:border-slate-800 dark:[&_.recharts-cartesian-axis-tick-value]:fill-slate-400 dark:[&_.recharts-default-tooltip]:!border-slate-700 dark:[&_.recharts-default-tooltip]:!bg-slate-900 dark:[&_.recharts-legend-item-text]:!text-slate-300 dark:[&_.text-slate-950]:text-white dark:[&_.text-slate-900]:text-slate-100 dark:[&_.text-slate-700]:text-slate-300 dark:[&_.text-slate-600]:text-slate-300 md:p-6 lg:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  className="org-page-content"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.4 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
