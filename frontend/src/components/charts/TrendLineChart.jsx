/**
 * TrendLineChart
 * ─────────────────────────────────────────────────────────────
 * Multi-line chart for comparing trends across periods or
 * comparing categories over time. Uses Recharts LineChart.
 *
 * props:
 *   data      — Array<{ label, [seriesKey]: number, ... }>
 *   series    — Array<{ key, name, color, dashed? }>
 *   xKey      — x-axis data key  (default 'label')
 *   height    — px
 *   goalLine  — optional number — draws a dashed reference line
 *   goalLabel — string label for the reference line
 */

import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COLORS } from '@/constants/theme';
import { formatMonthLabel } from '@/utils/formatters';

function ChartTooltip({ active, payload, label }) {
  const { i18n } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{formatMonthLabel(label, i18n.language)}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
            {Number(p.value).toFixed(1)} kg
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, stroke, payload, dataKey } = props;
  if (!payload) return null;
  const val = payload[dataKey] ?? 0;
  
  // Only render a visible dot if the value is strictly greater than 0
  if (val <= 0) return null;
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      stroke={stroke}
      strokeWidth={2}
      fill="#fff"
    />
  );
}

export default function TrendLineChart({
  data       = [],
  series     = [],
  xKey       = 'label',
  height     = 280,
  goalLine,
  goalLabel  = 'Goal',
}) {
  const { i18n } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: -8 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={s.color} stopOpacity={0.0}/>
            </linearGradient>
          ))}
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />

        {goalLine != null && (
          <ReferenceLine
            y={goalLine}
            stroke="#f59e0b"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: goalLabel,
              position: 'right',
              fontSize: 10,
              fill: '#f59e0b',
              dx: 4,
            }}
          />
        )}

        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dy={6}
          tickFormatter={(v) => formatMonthLabel(v, i18n.language)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
          width={45}
        />

        <Tooltip content={<ChartTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />

        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#gradient-${s.key})`}
            dot={<CustomDot stroke={s.color} dataKey={s.key} />}
            activeDot={{ r: 6, stroke: s.color, strokeWidth: 2, fill: s.color }}
            connectNulls
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
