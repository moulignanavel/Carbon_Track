import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { CATEGORY_COLORS, CHART_PALETTE } from '@/constants/theme';

function CustomTooltip({ active, payload }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="card-glass rounded-xl px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.payload.fill }} />
        <span className="font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
      </div>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {d.value.toFixed(2)} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e
        <span className="ml-2 font-semibold text-slate-700 dark:text-slate-200">
          ({d.payload.percent?.toFixed(1)}%)
        </span>
      </p>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-4">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

/**
 * CategoryPieChart — Donut chart for emissions by category
 *
 * @param {{ data, height, innerRadius }} props
 * data — Array<{ name: string, value: number, category?: string }>
 */
export default function CategoryPieChart({
  data = [],
  height = 280,
  innerRadius = 60,
}) {
  const { t } = useTranslation();
  const total = data.reduce((s, d) => s + d.value, 0);

  const enriched = data.map((d, i) => {
    const rawCat = d.category || d.name || '';
    const localizedName = d.displayName || t(`categories.${rawCat.toLowerCase()}`, { defaultValue: d.name || rawCat });
    return {
      ...d,
      name: localizedName,
      percent: total ? (d.value / total) * 100 : 0,
      fill: CATEGORY_COLORS[rawCat.toLowerCase()] ?? CHART_PALETTE[i % CHART_PALETTE.length],
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 48}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          stroke="none"
          aria-label="Monthly carbon emissions by category"
        >
          {enriched.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
