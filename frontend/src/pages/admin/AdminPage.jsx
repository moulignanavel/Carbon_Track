import { ShieldCheck, Users, Activity, Database } from 'lucide-react';
import { Card, Badge, StatCard, Alert } from '@/components/ui';

const MOCK_USERS = [
  { id: 1, username: 'alice',  email: 'alice@co.com',  role: 'USER',  logs: 24, joined: '2025-01-10' },
  { id: 2, username: 'bob',    email: 'bob@co.com',    role: 'USER',  logs: 8,  joined: '2025-03-02' },
  { id: 3, username: 'carol',  email: 'carol@co.com',  role: 'ADMIN', logs: 41, joined: '2024-12-01' },
];

export default function AdminPage() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h2>
          <p className="text-sm text-slate-500">Platform overview and user management</p>
        </div>
      </div>

      <Alert variant="warning">
        This panel is restricted to administrators. Changes affect all users.
      </Alert>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users"      value={MOCK_USERS.length} icon={Users}    iconBg="bg-blue-100 dark:bg-blue-900/30"   iconColor="text-blue-600" />
        <StatCard title="Total Logs"       value={MOCK_USERS.reduce((s, u) => s + u.logs, 0)} icon={Activity} iconBg="bg-green-100 dark:bg-green-900/30"  iconColor="text-green-600" />
        <StatCard title="Organisations"    value={1}                 icon={Database} iconBg="bg-teal-100 dark:bg-teal-900/30"   iconColor="text-teal-600" />
        <StatCard title="Admins"           value={MOCK_USERS.filter(u => u.role === 'ADMIN').length} icon={ShieldCheck} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600" />
      </div>

      <Card>
        <Card.Header title="Users" subtitle="All registered accounts" />
        <div className="overflow-x-auto">
          <table className="table-root">
            <thead className="table-head">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th text-right">Activities</th>
                <th className="table-th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase">
                        {u.username[0]}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{u.username}</span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{u.email}</td>
                  <td className="table-td">
                    <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'} size="xs">{u.role}</Badge>
                  </td>
                  <td className="table-td text-right font-medium">{u.logs}</td>
                  <td className="table-td text-slate-500 text-xs">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
