/**
 * WeeklyTrendChart
 * ─────────────────────────────────────────────────────────────
 * Stacked area chart showing daily emissions split by category
 * for the last 7 days. Uses Recharts AreaChart.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CATEGORY_COLORS } from '@/constants/theme';

const SERIES = [
  { key: 'transport', name: 'Transport', color: CATEGORY_COLORS.transport },
  { key: 'energy',    name: 'Energy',    color: CATEGORY_COLORS.energy    },
  { key: 'food',      name: 'Food',      color: CATEGORY_COLORS.food      },
  { key: 'other',     name: 'Other',     color: CATEGORY_COLORS.other     },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-xl text-xs min-w-[148px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {[...payload].reverse().map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
            {p.value.toFixed(2)} kg
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        <span className="font-semibold text-slate-600 dark:text-slate-300">Total</span>
        <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{total.toFixed(2)} kg</span>
      </div>
    </div>
  );
}

export default function WeeklyTrendChart({ data = [], height = 260, dailyGoal = 5 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`wt-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />

        {/* Daily goal reference line */}
        <ReferenceLine
          y={dailyGoal}
          stroke="#f59e0b"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: `Goal ${dailyGoal}kg`, position: 'right', fontSize: 10, fill: '#f59e0b' }}
        />

        <XAxis
          dataKey="day"
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
          width={28}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />

        {SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={1.5}
            fill={`url(#wt-grad-${s.key})`}
            stackId="stack"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
