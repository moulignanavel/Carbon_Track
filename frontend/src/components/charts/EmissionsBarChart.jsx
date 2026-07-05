import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { CHART_PALETTE, CATEGORY_COLORS } from '@/constants/theme';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {Number(p.value).toFixed(2)} kg
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * EmissionsBarChart — Vertical bar chart
 *
 * @param {{ data, dataKey, nameKey, colorByCategory, height }} props
 */
export default function EmissionsBarChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colorByCategory = false,
  height = 260,
  barColor,
  rounded = true,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey={nameKey}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}kg`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.06)' }} />
        <Bar
          dataKey={dataKey}
          name="CO₂e"
          radius={rounded ? [6, 6, 0, 0] : [0, 0, 0, 0]}
          maxBarSize={52}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                colorByCategory
                  ? (CATEGORY_COLORS[entry.category?.toLowerCase()] ?? CHART_PALETTE[i % CHART_PALETTE.length])
                  : (barColor ?? CHART_PALETTE[0])
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
