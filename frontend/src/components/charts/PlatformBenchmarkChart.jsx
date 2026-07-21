/**
 * PlatformBenchmarkChart.jsx
 * ─────────────────────────────────────────────────────────────
 * Grouped bar chart comparing user's emissions vs platform-wide average.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { COLORS } from '@/constants/theme';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const userVal = payload.find((p) => p.dataKey === 'userVal');
  const avgVal = payload.find((p) => p.dataKey === 'avgVal');
  const isBetter = userVal && avgVal ? userVal.value < avgVal.value : false;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-xl text-xs min-w-[180px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: p.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {p.value.toFixed(2)} kg
          </span>
        </div>
      ))}
      {userVal && avgVal && (
        <p className={`mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-xs ${isBetter ? 'text-green-500' : 'text-amber-500'}`}>
          {isBetter
            ? `✔ You are ${(avgVal.value - userVal.value).toFixed(1)} kg below average!`
            : `▲ You are ${(userVal.value - avgVal.value).toFixed(1)} kg above average`}
        </p>
      )}
    </div>
  );
}

export default function PlatformBenchmarkChart({ data = [], height = 272 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barGap={6} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />

        {/* Platform Average Bar */}
        <Bar dataKey="avgVal" name="Platform Avg" fill="#00bc7d" radius={[6, 6, 0, 0]} maxBarSize={22} />

        {/* User Emissions Bar */}
        <Bar dataKey="userVal" name="You" radius={[6, 6, 0, 0]} maxBarSize={22}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.userVal <= entry.avgVal ? '#3b82f6' : '#f59e0b'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
