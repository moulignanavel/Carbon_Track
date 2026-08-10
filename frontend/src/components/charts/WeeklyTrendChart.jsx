/**
 * WeeklyTrendChart
 * ─────────────────────────────────────────────────────────────
 * Stacked area chart showing daily emissions split by category
 * for the last 7 days. Uses Recharts AreaChart.
 */

import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-xl text-xs min-w-[148px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
            {p.value?.toFixed(2)} {t('activitiesPage.units.kg', { defaultValue: 'kg' })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyTrendChart({ data = [], height = 260 }) {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}
        accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
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
          width={45}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />

        <Line type="monotone" dataKey="currentWeek" name={t('dashboardPage.currentWeek', { defaultValue: 'Current week' })}
          stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="previousWeek" name={t('dashboardPage.previousWeek', { defaultValue: 'Previous week' })}
          stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
