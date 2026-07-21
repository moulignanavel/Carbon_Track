/**
 * StackedBarChart
 * ─────────────────────────────────────────────────────────────
 * Stacked bar chart — each bar is split by category series.
 * Used in Analytics for Daily / Weekly / Monthly / Yearly views.
 *
 * props:
 *   data     — Array<{ label, transport, electricity, food, shopping, energy }>
 *   xKey     — which field to use as the X-axis key  (default 'label')
 *   height   — chart height in px
 *   series   — Array<{ key, name, color }>  override default series
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { CATEGORY_COLORS } from '@/constants/theme';

export const DEFAULT_SERIES = [
  { key: 'transport',   name: 'Transport',   color: CATEGORY_COLORS.transport   },
  { key: 'electricity', name: 'Electricity', color: CATEGORY_COLORS.electricity ?? CATEGORY_COLORS.energy },
  { key: 'food',        name: 'Food',        color: CATEGORY_COLORS.food        },
  { key: 'shopping',    name: 'Shopping',    color: CATEGORY_COLORS.shopping    },
  { key: 'energy',      name: 'Home Energy', color: CATEGORY_COLORS.energy      },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {[...payload].reverse().map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: p.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
            {Number(p.value).toFixed(1)} kg
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        <span className="font-semibold text-slate-600 dark:text-slate-300">Total</span>
        <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{total.toFixed(1)} kg</span>
      </div>
    </div>
  );
}

export default function StackedBarChart({
  data     = [],
  xKey     = 'label',
  height   = 280,
  series   = DEFAULT_SERIES,
  maxBarSize = 40,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
        <XAxis
          dataKey={xKey}
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
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(34,197,94,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId="stack"
            radius={series.indexOf(s) === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={maxBarSize}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
