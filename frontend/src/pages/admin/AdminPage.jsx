import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Users, Activity, Database, Search, RefreshCw, Eye, Download, Flame, Car, Utensils, ShoppingBag, Building2, Pencil, Power } from 'lucide-react';
import { Card, Badge, StatCard, Alert, Button, Input, Modal, ProgressBar } from '@/components/ui';
import adminService from '@/services/api/adminService';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalActivityLogs: 0, totalEmissionsKg: 0, totalAdmins: 0, categoryBreakdown: {} });
  const [users, setUsers] = useState([]);
  const [factors, setFactors] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'factors'
  const [organisationSearch, setOrganisationSearch] = useState('');
  const [organisationPage, setOrganisationPage] = useState(1);
  const [organisationForm, setOrganisationForm] = useState(undefined);
  const [organisationName, setOrganisationName] = useState('');
  const [organisationMembers, setOrganisationMembers] = useState(null);
  const pageSize = 8;

  // User activity log inspection modal state
  const [inspectUser, setInspectUser] = useState(null);
  const [inspectLogs, setInspectLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, factorsRes, organisationsRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getEmissionFactors(),
        adminService.getOrganisations()
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value || {});
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (factorsRes.status === 'fulfilled') setFactors(factorsRes.value || []);
      if (organisationsRes.status === 'fulfilled') setOrganisations(organisationsRes.value || []);
    } catch (err) {
      toast.error('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspectUser = async (user) => {
    setInspectUser(user);
    setInspectLogs([]);
    setLoadingLogs(true);
    try {
      const logs = await adminService.getUserLogs(user.id);
      setInspectLogs(logs || []);
    } catch (err) {
      toast.error('Failed to fetch user activity logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRoleChange = async (user, role) => {
    try {
      const updated = await adminService.updateUserRole(user.id, role);
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item));
      toast.success(`${user.username} is now ${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const saveOrganisation = async () => {
    if (!organisationName.trim()) return;
    try {
      const saved = organisationForm
        ? await adminService.updateOrganisation(organisationForm.id, organisationName)
        : await adminService.createOrganisation(organisationName);
      setOrganisations((current) => organisationForm
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setOrganisationForm(undefined);
      setOrganisationName('');
      toast.success('Organisation saved');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Unable to save organisation');
    }
  };

  const toggleOrganisation = async (organisation) => {
    if (!window.confirm(`${organisation.active ? 'Deactivate' : 'Activate'} ${organisation.name}?`)) return;
    try {
      const updated = await adminService.setOrganisationActive(organisation.id, !organisation.active);
      setOrganisations((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update organisation');
    }
  };

  const viewMembers = async (organisation) => {
    try {
      const members = await adminService.getOrganisationMembers(organisation.id);
      setOrganisationMembers({ organisation, members });
    } catch {
      toast.error('Unable to load organisation members');
    }
  };

  const handleExportUserReport = () => {
    try {
      const headers = ['User ID', 'Username', 'Email', 'Role', 'Activities Logged', 'Total Emissions (kg CO2e)'];
      const rows = users.map((u) => [
        u.id,
        u.username,
        u.email,
        u.role,
        u.totalLogs || 0,
        (u.totalEmissionsKg || 0).toFixed(2),
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CarbonTrack_User_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Platform user report downloaded as CSV!');
    } catch (err) {
      toast.error('Failed to export CSV report');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const filteredOrganisations = useMemo(() => {
    const query = organisationSearch.trim().toLowerCase();
    return organisations.filter((organisation) => !query || organisation.name.toLowerCase().includes(query));
  }, [organisations, organisationSearch]);
  const organisationPages = Math.max(1, Math.ceil(filteredOrganisations.length / pageSize));
  const visibleOrganisations = filteredOrganisations.slice((organisationPage - 1) * pageSize, organisationPage * pageSize);

  const catMap = stats.categoryBreakdown || {};
  const totalEmissions = stats.totalEmissionsKg || 1;

  const categoryCards = [
    { key: 'Home Energy', label: 'Home Energy', icon: Flame, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40', value: catMap['Home Energy'] || 0 },
    { key: 'Transport', label: 'Transport', icon: Car, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40', value: catMap['Transport'] || 0 },
    { key: 'Food', label: 'Food & Diet', icon: Utensils, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40', value: catMap['Food'] || 0 },
    { key: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/40', value: catMap['Shopping'] || 0 },
  ];

  return (
    <div className="space-y-6 fade-in p-2 sm:p-4 text-slate-900 dark:text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E4432] text-white shadow-md shadow-[#1E4432]/30 border border-[#7FBF8C]/40">
            <ShieldCheck className="h-6 w-6 text-[#7FBF8C]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Admin Governance & Platform Oversight</h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Platform user activity inspection, category breakdown analytics & factor control</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handleExportUserReport} className="flex items-center gap-1.5 px-4 py-2 bg-[#1E4432] hover:bg-[#153225] text-white font-black text-xs rounded-xl shadow-md transition-all border border-[#7FBF8C]/40">
            <Download className="w-4 h-4 text-[#7FBF8C]" />
            <span>Export User CSV</span>
          </button>
          <button onClick={loadData} className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all">
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Banner with Crisp High-Contrast Text */}
      <div className="p-4 rounded-2xl bg-[#EBF5ED] dark:bg-emerald-950/60 border-2 border-[#7FBF8C] dark:border-emerald-700 text-[#0F2E22] dark:text-emerald-100 flex items-center gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#1E4432] dark:text-[#7FBF8C] shrink-0" />
        <p className="text-xs font-bold leading-relaxed">
          Administrative Portal: Active governance mode is enabled for platform oversight, user management, organisation management, audit review, analytics, and system factor control.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats.totalUsers || users.length}
          icon={Users}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          iconColor="text-blue-700 dark:text-blue-300"
        />
        <StatCard
          title="Total Activity Logs"
          value={stats.totalActivityLogs}
          icon={Activity}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          iconColor="text-emerald-700 dark:text-emerald-300"
        />
        <StatCard
          title="Platform CO₂e Tracked"
          value={`${(stats.totalEmissionsKg || 0).toFixed(1)} kg`}
          icon={Database}
          iconBg="bg-teal-100 dark:bg-teal-900/40"
          iconColor="text-teal-700 dark:text-teal-300"
        />
        <StatCard
          title="System Administrator"
          value={stats.totalAdmins || users.filter((u) => u.role === 'ADMIN').length}
          icon={ShieldCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          iconColor="text-[#1E4432] dark:text-[#7FBF8C]"
        />
      </div>

      {/* PLATFORM CATEGORY BREAKDOWN CARDS */}
      <Card className="p-5 shadow-sm border-2 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">Platform Category Emissions Breakdown</h3>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aggregated carbon impact per activity category across all registered users</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryCards.map((c) => {
            const Icon = c.icon;
            const pct = Math.min(100, Math.round((c.value / (totalEmissions || 1)) * 100));
            return (
              <div key={c.key} className="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${c.bg}`}>
                      <Icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{c.label}</span>
                  </div>
                  <span className="text-xs font-black text-[#1E4432] dark:text-[#7FBF8C] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">{pct}%</span>
                </div>

                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{c.value.toFixed(2)} <span className="text-xs font-bold text-slate-600 dark:text-slate-400">kg CO₂e</span></p>
                  <ProgressBar value={pct} max={100} size="xs" className="mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* High Contrast Tabs Header */}
      <div className="flex gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'users'
              ? 'bg-[#1E4432] text-white shadow-md border border-[#7FBF8C]/40'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          User Inspection ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('factors')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'factors'
              ? 'bg-[#1E4432] text-white shadow-md border border-[#7FBF8C]/40'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Emission Factors ({factors.length})
        </button>
        <button
          onClick={() => setActiveTab('organisations')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'organisations'
              ? 'bg-[#1E4432] text-white shadow-md border border-[#7FBF8C]/40'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Organisations ({organisations.length})
        </button>
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <Card className="shadow-sm border-2 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          <div className="p-4 sm:p-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">User Governance & Log Inspection</h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Inspect individual user activity logs, track emissions, and export reports</p>
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 font-bold" />
              <input
                type="text"
                placeholder="Search username, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1E4432]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">User Account</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Activities Logged</th>
                  <th className="py-3.5 px-4 text-right">Total Emissions</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-600 dark:text-slate-400 font-bold">
                      No users match your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E4432] text-[#7FBF8C] font-black text-xs shadow-xs">
                            {u.username ? u.username[0].toUpperCase() : 'U'}
                          </div>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold text-xs">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                          u.role === 'ADMIN' 
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200' 
                            : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-slate-100 text-sm">{u.totalLogs || u.logs || 0}</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {((u.totalEmissionsKg || 0)).toFixed(2)} kg CO₂e
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            aria-label={`Role for ${u.username}`}
                            value={u.role}
                            onChange={(event) => handleRoleChange(u, event.target.value)}
                            className="px-2 py-1.5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                          >
                            <option value="USER">USER</option>
                            <option value="ORG_ADMIN">ORG_ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            onClick={() => handleInspectUser(u)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-600 dark:border-emerald-500 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Inspect Logs</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* EMISSION FACTORS TAB */}
      {activeTab === 'factors' && (
        <Card className="shadow-sm border-2 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          <Card.Header
            title="System Emission Factors (DEFRA / EPA Standard)"
            subtitle="Global CO₂e multipliers used for computing activity carbon impact"
          />
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4 text-right">Factor (kg CO₂e / unit)</th>
                  <th className="py-3.5 px-4">Source / Region</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {factors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-600 dark:text-slate-400 font-bold">
                      Standard factors loaded (Grid: 0.233 kg/kWh, Petrol: 0.18 kg/km, Diesel: 0.165 kg/km).
                    </td>
                  </tr>
                ) : (
                  factors.map((f) => (
                    <tr key={f.id || f.activityType} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100 capitalize text-sm">{f.activityType?.replace(/_/g, ' ')}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">{f.unit}</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm tabular-nums">
                        {f.kgCo2ePerUnit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-bold text-[11px]">{f.source || 'DEFRA 2026'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'organisations' && (
        <Card className="shadow-sm border-2 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          <div className="p-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between">
            <div>
              <h3 className="font-black text-lg">Organisation Management</h3>
              <p className="text-xs font-bold text-slate-500">Create, edit, activate, deactivate, and inspect members.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input value={organisationSearch} onChange={(event) => { setOrganisationSearch(event.target.value); setOrganisationPage(1); }}
                  placeholder="Search organisations..."
                  className="pl-9 pr-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold" />
              </div>
              <Button onClick={() => { setOrganisationForm(null); setOrganisationName(''); }}>Create Organisation</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase">
                <tr><th className="p-4">Organisation</th><th className="p-4">Status</th><th className="p-4">Members</th><th className="p-4">Org Admins</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visibleOrganisations.map((organisation) => (
                  <tr key={organisation.id}>
                    <td className="p-4 font-black flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-700" />{organisation.name}</td>
                    <td className="p-4"><Badge variant={organisation.active ? 'success' : 'neutral'}>{organisation.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4 font-bold">{organisation.memberCount}</td>
                    <td className="p-4 font-bold">{organisation.orgAdminCount}</td>
                    <td className="p-4"><div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => viewMembers(organisation)}><Eye className="w-4 h-4" /> Members</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setOrganisationForm(organisation); setOrganisationName(organisation.name); }}><Pencil className="w-4 h-4" /> Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleOrganisation(organisation)}><Power className="w-4 h-4" />{organisation.active ? 'Deactivate' : 'Activate'}</Button>
                    </div></td>
                  </tr>
                ))}
                {!visibleOrganisations.length && <tr><td colSpan={5} className="p-10 text-center text-slate-500">No organisations found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-end items-center gap-3">
            <Button size="sm" variant="ghost" disabled={organisationPage === 1} onClick={() => setOrganisationPage((page) => page - 1)}>Previous</Button>
            <span className="text-xs font-bold">Page {organisationPage} of {organisationPages}</span>
            <Button size="sm" variant="ghost" disabled={organisationPage === organisationPages} onClick={() => setOrganisationPage((page) => page + 1)}>Next</Button>
          </div>
        </Card>
      )}

      {organisationForm !== undefined && (
        <Modal isOpen onClose={() => { setOrganisationForm(undefined); setOrganisationName(''); }} title={organisationForm ? 'Edit Organisation' : 'Create Organisation'}>
          <div className="space-y-4">
            <Input label="Organisation name" value={organisationName} onChange={(event) => setOrganisationName(event.target.value)} maxLength={100} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => { setOrganisationForm(undefined); setOrganisationName(''); }}>Cancel</Button><Button onClick={saveOrganisation}>Save</Button></div>
          </div>
        </Modal>
      )}

      {organisationMembers && (
        <Modal isOpen onClose={() => setOrganisationMembers(null)} title={`${organisationMembers.organisation.name} Members`}>
          <div className="max-h-96 overflow-auto divide-y divide-slate-200 dark:divide-slate-700">
            {organisationMembers.members.map((member) => (
              <div key={member.id} className="py-3 flex justify-between gap-3">
                <div><p className="font-bold">{member.username}</p><p className="text-xs text-slate-500">{member.email}</p></div>
                <Badge>{member.role}</Badge>
              </div>
            ))}
            {!organisationMembers.members.length && <p className="py-8 text-center text-slate-500">No members yet.</p>}
          </div>
        </Modal>
      )}

      {/* INSPECT USER LOGS MODAL */}
      {inspectUser && (
        <Modal isOpen={!!inspectUser} onClose={() => setInspectUser(null)} title={`User Activity Inspection: ${inspectUser.username}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-[#1E4432] text-white p-4 rounded-2xl flex items-center justify-between border-2 border-[#7FBF8C]/40">
              <div>
                <p className="font-black text-sm text-white">{inspectUser.username} ({inspectUser.email})</p>
                <p className="text-emerald-200 font-bold text-xs">Role: {inspectUser.role} | Total Emissions: {((inspectUser.totalEmissionsKg || 0)).toFixed(2)} kg CO₂e</p>
              </div>
              <span className="px-3 py-1 bg-[#7FBF8C] text-[#06140F] font-black text-xs rounded-full">
                {loadingLogs ? 'Fetching logs...' : `${inspectLogs.length} Total Logs`}
              </span>
            </div>

            {loadingLogs ? (
              <div className="py-10 text-center text-slate-600 dark:text-slate-300 font-black flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1E4432] dark:text-[#7FBF8C]" />
                <span>Loading activity history for {inspectUser.username}...</span>
              </div>
            ) : inspectLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-600 dark:text-slate-400 font-bold border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                No activity logs found for this user.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {inspectLogs.map((log) => (
                  <div key={log.id} className="p-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50/50 transition-colors">
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100 text-xs capitalize">
                        {log.activityType?.replace(/_/g, ' ')} ({log.category})
                      </p>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {log.amount} {log.unit} • Logged on {log.logDate}
                      </p>
                    </div>
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {((log.calculatedEmissions || 0)).toFixed(2)} kg CO₂e
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
