import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * DepartmentComparison
 * ─────────────────────────────────────────────────────────────
 * Pie chart showing emission distribution by department.
 */

export default function DepartmentComparison({ departments = [] }) {
  const COLORS = [
    '#16a34a', '#0d9488', '#06b6d4', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
  ];

  if (!departments || departments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-card dark:shadow-lg">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
          Department Breakdown
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No data available</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const chartData = departments.map(dept => ({
    name: dept.department,
    value: dept.percentageOfTotal || 0
  }));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-card dark:shadow-lg">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
        🏢 Department Breakdown
      </h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {departments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
        </PieChart>
      </ResponsiveContainer>

      {/* Department List */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
          Details
        </h3>
        {departments.slice(0, 5).map((dept, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-700 dark:text-slate-300">{dept.department}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {dept.percentageOfTotal.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
