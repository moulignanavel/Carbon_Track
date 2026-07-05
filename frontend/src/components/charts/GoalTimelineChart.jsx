/**
 * GoalTimelineChart
 * ─────────────────────────────────────────────────────────────
 * Area chart showing cumulative progress over time for a single goal.
 * Renders a solid green fill up to current progress and a dashed
 * amber target reference line.
 *
 * props:
 *   data      — Array<{ week|day|month: string, value: number }>
 *   target    — number  (horizontal reference line)
 *   color     — hex fill colour  (default green-500)
 *   height    — px
 *   xKey      — which field to use as X axis  (default 'week')
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COLORS } from '@/constants/theme';

function CustomTooltip({ active, payload, label, target }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const pct = target > 0 ? ((val / target) * 100).toFixed(1) : '—';
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      <p className="text-slate-500 dark:text-slate-400">
        Progress:{' '}
        <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
          {val.toFixed(2)} kg CO₂e
        </span>
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        Target: <span className="font-medium tabular-nums">{target} kg</span>
        {' '}· <span className={`font-semibold ${pct >= 100 ? 'text-red-500' : 'text-green-600'}`}>{pct}%</span>
      </p>
    </div>
  );
}

export default function GoalTimelineChart({
  data   = [],
  target = 100,
  color  = COLORS.green[500],
  height = 180,
  xKey   = 'week',
}) {
  const gradId = `goal-grad-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />

        {/* Target reference line */}
        <ReferenceLine
          y={target}
          stroke="#f59e0b"
          strokeDasharray="5 3"
          strokeWidth={1.5}
          label={{
            value: `Target ${target}kg`,
            position: 'insideTopRight',
            fontSize: 10,
            fill: '#f59e0b',
            dy: -6,
          }}
        />

        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dy={4}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
          domain={[0, Math.max(target * 1.1, 10)]}
        />

        <Tooltip content={<CustomTooltip target={target} />} />

        <Area
          type="monotone"
          dataKey="value"
          name="Progress"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
