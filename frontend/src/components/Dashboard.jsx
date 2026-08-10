import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar, Legend
} from 'recharts';
import { Navigation, Zap, UtensilsCrossed, ShoppingBag, Leaf, HelpCircle } from 'lucide-react';

const COLORS = {
  TRANSPORT: '#3b82f6',     // Blue
  ELECTRICITY: '#f59e0b',   // Orange/Yellow
  FOOD: '#10b981',          // Emerald
  SHOPPING: '#8b5cf6'       // Purple
};

const CATEGORY_ICONS = {
  transport: Navigation,
  electricity: Zap,
  food: UtensilsCrossed,
  shopping: ShoppingBag
};

export default function Dashboard({ logs = [] }) {
  const { t } = useTranslation();
  
  // 1. Calculations
  const totalEmissions = logs.reduce((sum, log) => sum + log.calculatedEmissions, 0);
  const averageLog = logs.length > 0 ? (totalEmissions / logs.length) : 0;
  
  const getCategoryData = () => {
    const data = { transport: 0, electricity: 0, food: 0, shopping: 0 };
    logs.forEach(log => {
      const cat = log.category.toLowerCase();
      if (data[cat] !== undefined) data[cat] += log.calculatedEmissions;
    });
    return Object.keys(data)
      .map(key => ({ 
        name: t(`categories.${key}`, { defaultValue: key.toUpperCase() }), 
        rawKey: key.toUpperCase(),
        value: parseFloat(data[key].toFixed(2)) 
      }))
      .filter(item => item.value > 0);
  };

  const getTrendData = () => {
    const sorted = [...logs].sort((a, b) => new Date(a.logDate) - new Date(b.logDate));
    const grouped = {};
    sorted.forEach(log => {
      const d = log.logDate;
      grouped[d] = (grouped[d] || 0) + log.calculatedEmissions;
    });
    return Object.keys(grouped).map(date => ({
      date,
      Emissions: parseFloat(grouped[date].toFixed(2))
    }));
  };

  const getBarData = () => {
    const data = { transport: 0, electricity: 0, food: 0, shopping: 0 };
    logs.forEach(log => {
      const cat = log.category.toLowerCase();
      if (data[cat] !== undefined) data[cat] += log.calculatedEmissions;
    });
    return Object.keys(data).map(key => ({
      Category: t(`categories.${key}`, { defaultValue: key.toUpperCase() }),
      rawKey: key.toUpperCase(),
      Emissions: parseFloat(data[key].toFixed(2))
    }));
  };

  const categoryData = getCategoryData();
  const trendData = getTrendData();
  const barData = getBarData();

  if (logs.length === 0) {
    return (
      <div className="flex-center flex-col min-h-[50vh] text-center p-8 animate-fade-in">
        <div className="bg-emerald-500/10 p-5 rounded-full border border-emerald-500/25 mb-5">
          <Leaf className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('dashboardPage.noActivitiesLogged', { defaultValue: 'No activities logged yet!' })}</h2>
        <p className="text-sm text-gray-400 max-w-md">
          {t('dashboardPage.logActivitiesToSeeTrend', { defaultValue: 'Ready to track your carbon footprint? Go to the Log Activity tab above to record your first transit, meal, energy usage, or retail purchase!' })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">{t('dashboardPage.totalCarbonFootprint', { defaultValue: 'Total Carbon Footprint' })}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-glow-primary text-blue-400">
              {totalEmissions.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 font-bold">{t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">{t('dashboardPage.cumulativeEmissionsRegistered', { defaultValue: 'Cumulative emissions registered' })}</p>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">{t('dashboardPage.averageImpactPerEntry', { defaultValue: 'Average Impact Per Entry' })}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-glow-secondary text-emerald-400">
              {averageLog.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 font-bold">{t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">{t('dashboardPage.totalEmissionsDividedByLogs', { defaultValue: 'Total emissions divided by logs' })}</p>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">{t('dashboardPage.targetReductionGoal', { defaultValue: 'Target Reduction Goal' })}</span>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-extrabold text-purple-400">15% {t('dashboardPage.reduction', { defaultValue: 'reduction' })}</span>
              <span className="text-xs text-emerald-400 font-bold">{t('challengesPage.active', { defaultValue: 'Active' })}</span>
            </div>
            {/* Goal Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">45% {t('dashboardPage.progressTowardMilestone', { defaultValue: 'progress toward milestone target' })}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Distribution Pie Chart */}
        <div className="glass-panel p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">{t('dashboardPage.categoryBreakdown', { defaultValue: 'Category Breakdown' })}</h3>
            <p className="text-xs text-gray-400 mb-6">{t('dashboardPage.emissionsDistributionAcrossSectors', { defaultValue: 'Emissions distribution across sectors' })}</p>
          </div>
          <div className="h-64 flex-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.rawKey] || '#10b981'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1423', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary */}
            <div className="absolute flex-center flex-col">
              <span className="text-2xl font-bold">{totalEmissions.toFixed(0)}</span>
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e</span>
            </div>
          </div>
          
          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            {Object.keys(COLORS).map(key => {
              const matched = categoryData.find(item => item.rawKey === key);
              const val = matched ? matched.value : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[key] }} />
                  <span className="text-gray-400 uppercase text-[10px] tracking-wide">{t(`categories.${key.toLowerCase()}`, { defaultValue: key.toLowerCase() })}</span>
                  <span className="text-gray-200 ml-auto">{val.toFixed(1)} {t('activitiesPage.units.kg', { defaultValue: 'kg' })}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trends Line Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-1">{t('dashboardPage.carbonFootprintTrend', { defaultValue: 'Carbon Footprint Trend' })}</h3>
          <p className="text-xs text-gray-400 mb-6">{t('dashboardPage.dailyAggregatedGhgImpact', { defaultValue: 'Daily aggregated greenhouse gas impact' })}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1423', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line 
                  type="monotone" 
                  name={t('dashboardPage.emissions', { defaultValue: 'Emissions' })}
                  dataKey="Emissions" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Comparison Bar Chart */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-1">{t('dashboardPage.categoryComparisons', { defaultValue: 'Category Comparisons' })}</h3>
        <p className="text-xs text-gray-400 mb-6">{t('dashboardPage.carbonOutputComparisonAcrossSectors', { defaultValue: 'Carbon output comparison across sectors' })}</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="Category" stroke="#6b7280" style={{ fontSize: '10px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1423', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar name={t('dashboardPage.emissions', { defaultValue: 'Emissions' })} dataKey="Emissions" fill="#10b981" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.rawKey] || '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-1">{t('dashboardPage.activityLoggingStream', { defaultValue: 'Activity Logging Stream' })}</h3>
        <p className="text-xs text-gray-400 mb-6">{t('dashboardPage.historicalRecordOfEmissions', { defaultValue: 'Historical record of carbon-producing emissions' })}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t('activitiesPage.colCategory', { defaultValue: 'Category' })}</th>
                <th className="py-3 px-4">{t('activitiesPage.activityTypeLabel', { defaultValue: 'Activity Type' })}</th>
                <th className="py-3 px-4">{t('activitiesPage.colAmount', { defaultValue: 'Usage/Amount' })}</th>
                <th className="py-3 px-4">{t('activitiesPage.colCo2e', { defaultValue: 'Carbon Impact' })}</th>
                <th className="py-3 px-4">{t('activitiesPage.colDate', { defaultValue: 'Date' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {[...logs].reverse().map((log) => {
                const Icon = CATEGORY_ICONS[log.category.toLowerCase()] || HelpCircle;
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold capitalize flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${
                        log.category.toLowerCase() === 'transport' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        log.category.toLowerCase() === 'electricity' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                        log.category.toLowerCase() === 'food' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {t(`categories.${log.category.toLowerCase()}`, { defaultValue: log.category })}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-medium capitalize">
                      {t(`activitiesPage.types.${log.activityType}`, { defaultValue: log.activityType.replace('_', ' ') })}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-semibold">
                      {log.amount} {t(`activitiesPage.units.${log.unit}`, { defaultValue: log.unit })}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-extrabold">
                      {log.calculatedEmissions.toFixed(2)} {t('activitiesPage.units.kg', { defaultValue: 'kg' })}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {log.logDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
