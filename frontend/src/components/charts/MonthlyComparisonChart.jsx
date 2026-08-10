/**
 * MonthlyComparisonChart
 * ─────────────────────────────────────────────────────────────
 * Grouped bar chart comparing actual emissions vs target per month.
 * Uses Recharts BarChart with two Bar series.
 */

import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { COLORS } from '@/constants/theme';
import { formatMonthLabel } from '@/utils/formatters';

function CustomTooltip({ active, payload, label }) {
  const { t, i18n } = useTranslation();
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === 'emissions');
  const target = payload.find((p) => p.dataKey === 'target');
  const over   = actual && target ? actual.value > target.value : false;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{formatMonthLabel(label, i18n.language)}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: p.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
            {p.value} {t('activitiesPage.units.kg', { defaultValue: 'kg' })}
          </span>
        </div>
      ))}
      {actual && target && (
        <p className={`mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium text-xs ${over ? 'text-red-500' : 'text-green-600'}`}>
          {over
            ? `▲ ${(actual.value - target.value).toFixed(1)} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })} ${t('dashboardPage.overTarget', { defaultValue: 'over target' })}`
            : `▼ ${(target.value - actual.value).toFixed(1)} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })} ${t('dashboardPage.underTarget', { defaultValue: 'under target' })}`}
        </p>
      )}
    </div>
  );
}

export default function MonthlyComparisonChart({ data = [], height = 240 }) {
  const { t, i18n } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
        <XAxis
          dataKey="month"
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />

        {/* Actual */}
        <Bar dataKey="emissions" name={t('dashboardPage.actual', { defaultValue: 'Actual' })} radius={[5, 5, 0, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.emissions > entry.target ? '#ef4444' : '#00bc7d'}
            />
          ))}
        </Bar>

        {/* Target */}
        <Bar dataKey="target" name={t('dashboardPage.target', { defaultValue: 'Target' })} fill="#cbd5e1" radius={[5, 5, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
