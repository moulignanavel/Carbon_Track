import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Building2, ChevronLeft, CircleHelp, FileText,
  Gauge, Leaf, LogOut, Target, TrendingDown, TrendingUp,
  Trophy, UserCircle, Users, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const groups = [
  { label: 'Overview', items: [['/organisation/dashboard', 'Dashboard', Gauge]] },
  {
    label: 'Insights',
    items: [
      ['/organisation/analytics', 'Analytics', BarChart3],
      ['/organisation/monthly-trends', 'Monthly Trends', TrendingUp],
      ['/organisation/departments', 'Department Comparison', Building2],
    ],
  },
  {
    label: 'People',
    items: [
      ['/organisation/employees', 'Employees', Users],
      ['/organisation/top-contributors', 'Top Contributors', Trophy],
      ['/organisation/lowest-footprint', 'Lowest Footprint', TrendingDown],
    ],
  },
  {
    label: 'Sustainability',
    items: [
      ['/organisation/goals', 'Organisation Goals', Target],
      ['/organisation/activity-logs', 'Activity Logs', Activity],
      ['/organisation/reports', 'CSR Reports', FileText],
    ],
  },
  {
    label: 'Settings',
    items: [
      ['/organisation/profile', 'Organisation Profile', Building2],
      ['/organisation/my-profile', 'My Profile', UserCircle],
    ],
  },
];

export default function OrganisationSidebar({ open, collapsed, onClose, onCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="org-sidebar-overlay fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`org-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-emerald-950/70 bg-[#0b271e] text-white transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          collapsed ? 'w-[76px]' : 'w-[252px]'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-[68px] items-center gap-3 border-b border-white/10 px-[18px]">
          <button type="button" aria-label={collapsed?'Expand sidebar':'Go to organisation dashboard'} onClick={()=>collapsed?onCollapse():navigate('/organisation/dashboard')} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </button>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[15px]">CarbonTrack</strong>
              <span className="block text-xs text-emerald-200">Organisation portal</span>
            </div>
          )}
          {!collapsed&&<button type="button" aria-label="Collapse sidebar" title="Collapse sidebar" onClick={onCollapse} className="ml-auto hidden h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:flex"><ChevronLeft className="h-5 w-5"/></button>}
          <button type="button" aria-label="Close navigation" className="ml-auto p-2 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Organisation navigation" className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              {!collapsed && (
                <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/65">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(([to, label, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={collapsed ? label : undefined}
                    onClick={onClose}
                    className={({ isActive }) => `flex min-h-10 items-center rounded-lg text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                      collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    } ${isActive ? 'bg-emerald-500 font-semibold text-white' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>Live organisation sync · 5 sec</span>
            </div>
          )}
          <a
            href="mailto:support@carbontrack.com"
            title={collapsed ? 'Help' : undefined}
            className={`flex min-h-10 items-center rounded-lg text-sm text-slate-300 hover:bg-white/[0.07] hover:text-white ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}
          >
            <CircleHelp className="h-[18px] w-[18px]" />
            {!collapsed && <span>Help</span>}
          </a>
          <button
            type="button"
            title={collapsed ? 'Logout' : undefined}
            onClick={logout}
            className={`mt-1 flex min-h-10 w-full items-center rounded-lg text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-200 ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
